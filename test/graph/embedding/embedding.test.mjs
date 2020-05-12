import Embedding from '../../../src/graph/embedding/embedding.mjs';

import EmbeddedVertex from '../../../src/graph/embedding/embedded_vertex.mjs';
import EmbeddedEdge from '../../../src/graph/embedding/embedded_edge.mjs';

import Graph from '../../../src/graph/graph.mjs';
import Vertex from '../../../src/graph/vertex.mjs';
import Edge from '../../../src/graph/edge.mjs';

import Point2D from '../../../src/geometric/point2d.mjs';
import Point from '../../../src/geometric/point.mjs';

import { testAPI, testStaticAPI } from '../../utils/test_common.mjs';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_NOT_FOUND, ERROR_MSG_EDGE_NOT_FOUND } from '../../../src/common/errors.mjs';


import { range } from '../../../src/common/numbers.mjs';

import 'mjs-mocha';
import chai from "chai";
import should from "should";   // lgtm[js/unused-local-variable]
import { randomInt } from '../../../src/common/numbers.mjs';
const expect = chai.expect;    // lgtm[js/unused-local-variable]

describe('Embedding API', () => {

  it('# Class should have a constructor method', function () {
    Embedding.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = ['fromJson', 'fromJsonObject', 'forGraph', 'completeGraph', 'completeBipartiteGraph'];
    testStaticAPI(Embedding, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let embedding = Embedding.forGraph(new Graph());
    let methods = ['constructor', 'getVertex', 'getEdge', 'setVertexPosition', 'setEdgeControlPoint',
      'intersections', 'isPlane', 'equals', 'clone', 'toJson', 'toJsonObject', 'toSvg'];
    let attributes = ['vertices', 'edges'];
    testAPI(embedding, attributes, methods);
  });
});

describe('Embedding Creation', () => {
  describe('# Parameters', () => {
    const v = new EmbeddedVertex(1, new Point2D(1, 2));

    describe('# 1st argument (mandatory)', () => {
      it('should throw when vertices is not an array or iterable', () => {
        (() => new Embedding(null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', null));
        (() => new Embedding(undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', undefined));
        (() => new Embedding({})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', {}));
        (() => new Embedding(1)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', 1));
      });

      it('should throw when not all its entries are embedded vertices', () => {
        (() => new Embedding([1], [])).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', [1]));
        (() => new Embedding(['test'], [])).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', ['test']));
        let vs = [v, 'test'];
        (() => new Embedding(vs, [])).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', vs));
        vs = [new Vertex(1)];
        (() => new Embedding(vs, [])).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', vs));
      });
    });

    describe('# 2nd argument (mandatory)', () => {
      it('should throw when edges is not an array or iterable', () => {
        (() => new Embedding([], null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', null));
        (() => new Embedding([], undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', undefined));
        (() => new Embedding([], {})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', {}));
        (() => new Embedding([], 1)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', 1));
      });

      it('should throw when not all its entries are embedded vertices', () => {
        (() => new Embedding([], [1])).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', [1]));
        (() => new Embedding([], ['test'])).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', ['test']));
        const vs = [v];
        let es = [1, 2, 3];
        (() => new Embedding(vs, es)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', es));
        es = [new EmbeddedEdge(v, v), 'test'];
        (() => new Embedding(vs, es)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', es));
      });
    });

  });
});

describe('Attributes', () => {
  const u = new EmbeddedVertex('u', new Point2D(0.1, -0.2));
  const v = new EmbeddedVertex(1, new Point2D(1, 2));

  it('should create an embedding with the right entries in vertices and edges', () => {
    const e1 = new EmbeddedEdge(v, v);
    const e2 = new EmbeddedEdge(u, v);
    let emb = new Embedding([u, v], [e1, e2]);
    [u, v].forEach(w => [...emb.vertices].some(z => w.equals(z)).should.be.true());
    [e1, e2].forEach(e => [...emb.edges].some(e_ => e.equals(e_)).should.be.true());
  });
});

describe('Methods', () => {
  describe('setVertexPosition()', () => {
    const p = new Point2D(-0.1, 2.5);
    const q = new Point2D(2.5, 3.14);
    const u = new EmbeddedVertex('u', p);
    const v = new EmbeddedVertex('v', q, { data: { 'deep': 43.5 } });
    const e = new EmbeddedEdge(u, v, { weight: 12, label: 'edge', arcControlDistance: -32, isDirected: true });
    const emb = new Embedding([u, v], [e]);

    it('should throw when vertex is not in the graph (embedding)', () => {
      (() => emb.setVertexPosition(null)).should.throw(ERROR_MSG_VERTEX_NOT_FOUND('Embedding.setVertexPosition', null));
      (() => emb.setVertexPosition(undefined)).should.throw(ERROR_MSG_VERTEX_NOT_FOUND('Embedding.setVertexPosition', undefined));
      (() => emb.setVertexPosition('not there')).should.throw(ERROR_MSG_VERTEX_NOT_FOUND('Embedding.setVertexPosition', 'not there'));
    });

    it('should throw when position is not a valid Point2D', () => {
      (() => emb.setVertexPosition(v, null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding.setVertexPosition', 'position', null));
      (() => emb.setVertexPosition(v, undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding.setVertexPosition', 'position', undefined));
      (() => emb.setVertexPosition(v, 'not a point')).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding.setVertexPosition', 'position', 'not a point'));
      (() => emb.setVertexPosition(v, new Point(1, 2, 3))).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding.setVertexPosition', 'position', new Point(1, 2, 3)));
    });

    it('# should set the new position correctly', () => {
      emb.getVertex(v).position.equals(q).should.be.true();
      emb.setVertexPosition(v, p);
      emb.getVertex(v).position.equals(p).should.be.true();
      const t = new Point2D(1, 1);
      emb.setVertexPosition(v.id, t);
      emb.getVertex(v).position.equals(t).should.be.true();
    });
  });

  describe('setEdgeControlPoint()', () => {
    const p = new Point2D(-0.1, 2.5);
    const q = new Point2D(2.5, 3.14);
    const u = new EmbeddedVertex('u', p);
    const v = new EmbeddedVertex('v', q);
    const e = new EmbeddedEdge(u, v, { weight: 12, label: 'edge', arcControlDistance: -32, isDirected: true });
    const emb = new Embedding([u, v], [e]);

    it('should throw when vertex is not in the graph (embedding)', () => {
      (() => emb.setEdgeControlPoint(null)).should.throw(ERROR_MSG_EDGE_NOT_FOUND('Embedding.setEdgeControlPoint', null));
      (() => emb.setEdgeControlPoint(undefined)).should.throw(ERROR_MSG_EDGE_NOT_FOUND('Embedding.setEdgeControlPoint', undefined));
      (() => emb.setEdgeControlPoint('not there')).should.throw(ERROR_MSG_EDGE_NOT_FOUND('Embedding.setEdgeControlPoint', 'not there'));
    });

    it('should throw when arcControlDistance is not a valid number', () => {
      (() => emb.setEdgeControlPoint(e, null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding.setEdgeControlPoint', 'arcControlDistance', null));
      (() => emb.setEdgeControlPoint(e, undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding.setEdgeControlPoint', 'arcControlDistance', undefined));
      (() => emb.setEdgeControlPoint(e, 'not a num')).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding.setEdgeControlPoint', 'arcControlDistance', 'not a num'));
    });

    it('# should set the new arcControlDistance correctly', () => {
      emb.getEdge(e).arcControlDistance.should.eql(-32);
      emb.setEdgeControlPoint(e, '44');
      emb.getEdge(e).arcControlDistance.should.eql(44);
      emb.setEdgeControlPoint(e.id, 0.14);
      emb.getEdge(e).arcControlDistance.should.eql(0.14);
    });
  });

  describe('intersections()', () => {
    it('# return false for embeddings for complete graphs with 5 or more vertices (they can\'t be plane)', () => {
      const expectedIntersections = [5, 15, 35, 70];
      range(5, 9).forEach(n => {
        const emb = Embedding.completeGraph(n, 480);
        emb.intersections().should.be.eql(expectedIntersections[n - 5]);
      });
    });

    it('# return false for embeddings for complete bipartite graphs with 3 or more vertices per-partition (they can\'t be plane)', () => {
      Embedding.completeBipartiteGraph(2, 3, 480).intersections().should.eql(3);
      // Check also directed graph
      Embedding.completeBipartiteGraph(2, 3, 480, true).intersections().should.eql(12);
      Embedding.completeBipartiteGraph(2, 4, 480).intersections().should.eql(6);
      Embedding.completeBipartiteGraph(2, 5, 480).intersections().should.eql(10);
      Embedding.completeBipartiteGraph(3, 3, 480).intersections().should.eql(9);
      Embedding.completeBipartiteGraph(3, 4, 480).intersections().should.eql(18);
      Embedding.completeBipartiteGraph(4, 3, 480).intersections().should.eql(18);
      Embedding.completeBipartiteGraph(4, 4, 480).intersections().should.eql(36);
      Embedding.completeBipartiteGraph(4, 5, 480).intersections().should.eql(60);
      Embedding.completeBipartiteGraph(4, 5, 480, true).intersections().should.eql(240);
    });

    it('# return 1 for a non-plane embedding of K4', () => {
      let emb = Embedding.completeGraph(4, 480);
      emb.intersections().should.eql(1);
      // Directed Graph
      emb = Embedding.completeGraph(4, 480, true);
      emb.intersections().should.eql(4);
    });

    it('# return 0 for a plane embedding of K4', () => {
      let emb = Embedding.completeGraph(4, 480);
      emb.setVertexPosition('1', new Point2D(0, 0));
      emb.setVertexPosition('2', new Point2D(100, 0));
      emb.setVertexPosition('3', new Point2D(0, 100));
      emb.setVertexPosition('4', new Point2D(50, 50));
      emb.intersections().should.eql(1);
      emb.setVertexPosition('4', new Point2D(25, 25));
      emb.intersections().should.eql(0);
      // Directed graph
      emb = Embedding.completeGraph(4, 480, true);
      emb.setVertexPosition('1', new Point2D(0, 0));
      emb.setVertexPosition('2', new Point2D(100, 0));
      emb.setVertexPosition('3', new Point2D(0, 100));
      emb.setVertexPosition('4', new Point2D(25, 25));
      emb.intersections().should.eql(0);
    });
  });

  describe('isPlane()', () => {
    it('# return false for embeddings for complete graphs with 5 or more vertices (they can\'t be plane)', () => {
      range(5, 11).forEach(n => {
        const emb = Embedding.completeGraph(n, 480);
        emb.isPlane().should.be.false();
      });
    });

    it('# return false for embeddings for complete bipartite graphs with 3 or more vertices per-partition (they can\'t be plane)', () => {
      range(3, 11).forEach(n => {
        const emb = Embedding.completeBipartiteGraph(n, randomInt(3, 11), 480);
        emb.isPlane().should.be.false();
      });
    });

    it('# return false for a non-plane embedding of K4', () => {
      let emb = Embedding.completeGraph(4, 480);
      emb.isPlane().should.be.false();
      emb = Embedding.completeGraph(4, 480, true);
      emb.isPlane().should.be.false();
    });

    it('# return true for a plane embedding of K4', () => {
      let emb = Embedding.completeGraph(4, 480);
      emb.setVertexPosition('1', new Point2D(0, 0));
      emb.setVertexPosition('2', new Point2D(100, 0));
      emb.setVertexPosition('3', new Point2D(0, 100));
      emb.setVertexPosition('4', new Point2D(50, 50));
      // Edge case: vertex 4 lies on edge 2->3
      emb.isPlane().should.be.false();
      emb.setVertexPosition('4', new Point2D(25, 25));
      emb.isPlane().should.be.true();

      emb = Embedding.completeGraph(4, 480, true);
      emb.setVertexPosition('1', new Point2D(0, 0));
      emb.setVertexPosition('2', new Point2D(100, 0));
      emb.setVertexPosition('3', new Point2D(0, 100));
      emb.setVertexPosition('4', new Point2D(25, 25));
      emb.isPlane().should.be.true();
    });
  });

  describe('clone()', () => {
    const point = new Point2D(-0.1, 2.5);
    const u = new EmbeddedVertex('u', point);
    const v = new EmbeddedVertex('v', point);
    const e = new EmbeddedEdge(u, v, { weight: 12, label: 'edge', arcControlDistance: -32, isDirected: true });

    it('# should make an exact copy', () => {
      const emb = new Embedding([u, v], [e]);
      const clone = emb.clone();
      clone.equals(emb).should.be.true();
      clone.vertices.should.eql(emb.vertices);
    });
  });

  describe('toJson()', () => {
    const point = new Point2D(-0.1, 2.5);
    const u = new EmbeddedVertex('u', point);
    const v = new EmbeddedVertex('v', point);
    const e = new EmbeddedEdge(u, v, { weight: 12, label: 'edge', arcControlDistance: -32, isDirected: true });

    it('# should return a valid json', () => {
      const emb = new Embedding([u, v], [e]);
      JSON.parse(emb.toJson()).should.eql({
        vertices: [u.toJson(), v.toJson()],
        edges: [e.toJson()]
      });
    });
  });

  describe('fromJson()', () => {
    const point = new Point2D(-0.1, 2.5);
    const u = new EmbeddedVertex('u', point, { weight: 4.3, label: 'test v label', data: ['1', 2, 3] });
    const v = new EmbeddedVertex('v', point);
    const e = new EmbeddedEdge(u, v, { weight: 12, label: 'edge', arcControlDistance: -32, isDirected: true });

    it('# applyed to the result of toJson, it should match source vertex', () => {
      let emb = new Embedding([u, v], [e]);
      Embedding.fromJson(emb.toJson()).equals(emb).should.be.true();

      emb = Embedding.completeGraph(9, 400);
      Embedding.fromJson(emb.toJson()).equals(emb).should.be.true();

      emb = Embedding.completeBipartiteGraph(4, 5, 400);
      Embedding.fromJson(emb.toJson()).equals(emb).should.be.true();
    });
  });

  describe('forGraph()', () => {
    const u = new Vertex('u');
    const v = new Vertex('v');
    const w = new Vertex('w');
    const e1 = new Edge(u, v, { weight: 12, label: 'edge' });
    const e2 = new Edge(w, v);
    const e3 = new Edge(u, w);
    const e4 = new Edge(w, w);

    let g;

    before(() => {
      g = new Graph();
      [u, v, w].forEach(vertex => g.addVertex(vertex));
      [e1, e2, e3, e4].forEach(e => g.addEdge(e));
    });

    it('# should create edges and vertices', () => {
      let emb = Embedding.forGraph(g);
      [u, v, w].forEach(vertex => {
        const eV = emb.getVertex(vertex.id);
        eV.name.should.eql(vertex.name);
        eV.weight.should.eql(vertex.weight);
        eV.position.constructor.should.eql(Point2D);
      });

      [e1, e2, e3, e4].forEach(e => {
        const eE = emb.getEdge(e.id);
        eE.source.name.should.eql(e.source.name);
        eE.destination.name.should.eql(e.destination.name);
        (eE.name === e.name).should.be.true();
        eE.weight.should.eql(e.weight);
      });
    });

    it('# should allow passing coordinates for some or all vertices', () => {
      const p = new Point2D(1, 2);
      const q = new Point2D(2, 1);
      let emb = Embedding.forGraph(g, { vertexCoordinates: { [u.id]: p, [w.id]: q } });
      [u, v, w].forEach(vertex => {
        const eV = emb.getVertex(vertex.id);
        eV.name.should.eql(vertex.name);
        eV.weight.should.eql(vertex.weight);
        eV.position.constructor.should.eql(Point2D);
      });

      [e1, e2, e3, e4].forEach(e => {
        const eE = emb.getEdge(e.id);
        eE.source.name.should.eql(e.source.name);
        eE.destination.name.should.eql(e.destination.name);
        (eE.name === e.name).should.be.true();
        eE.weight.should.eql(e.weight);
      });

      emb.getVertex(u.id).position.equals(p).should.be.true();
      emb.getVertex(u.id).position.equals(q).should.be.false();

      emb.getVertex(w.id).position.equals(q).should.be.true();
      emb.getVertex(w.id).position.equals(p).should.be.false();
    });

    it('# should allow passing arc\'s control point for some or all edges', () => {
      let emb = Embedding.forGraph(g, { edgeArcControlDistances: { [e2.id]: -91, [e3.id]: 0.101 } });
      [u, v, w].forEach(vertex => {
        const eV = emb.getVertex(vertex.id);
        eV.name.should.eql(vertex.name);
        eV.weight.should.eql(vertex.weight);
        eV.position.constructor.should.eql(Point2D);
      });

      [e1, e2, e3, e4].forEach(e => {
        const eE = emb.getEdge(e.id);
        eE.source.name.should.eql(e.source.name);
        eE.destination.name.should.eql(e.destination.name);
        (eE.name === e.name).should.be.true();
        eE.weight.should.eql(e.weight);
      });

      emb.getEdge(e1.id).arcControlDistance.should.eql(EmbeddedEdge.DEFAULT_EDGE_BEZIER_CONTROL_DISTANCE);
      emb.getEdge(e2.id).arcControlDistance.should.eql(-91);
      emb.getEdge(e3.id).arcControlDistance.should.eql(0.101);
      emb.getEdge(e4.id).arcControlDistance.should.eql(EmbeddedEdge.DEFAULT_EDGE_LOOP_RADIUS);
    });
  });

  describe('toSVG()', () => {
    it('# complete graphs should return a valid svg', () => {
      console.log(Embedding.completeGraph(10, 400).toSvg(400, 400, {
        graphCss: ['complete'],
        verticesCss: { '1': ['warning'], '2': ['error'], '3': ['warning', 'source'] },
        drawEdgesAsArcs: true,
        displayEdgesWeight: false,
        displayEdgesLabel: false
      }));
    });

    it('# complete bipartite graphs should return a valid svg', () => {
      let vClasses = {};

      range(1, 7).forEach(i => vClasses[`${i}`] = ['left']);
      range(7, 11).forEach(i => vClasses[`${i}`] = ['right']);

      console.log(Embedding.completeBipartiteGraph(6, 4, 400).toSvg(400, 400, {
        graphCss: ['complete bipartite'],
        verticesCss: vClasses,
        displayEdgesWeight: false,
        displayEdgesLabel: false
      }));
    });

    it('# DAG should return a valid svg', () => {
      let graph = new Graph();
      graph.createVertex('Start', { weight: 2 });
      graph.createVertex('Finish', { weight: 2.5 });
      const vA = graph.createVertex('A');
      const vB = graph.createVertex('B', { weight: 1.5 });
      const vC = graph.createVertex('C', { weight: 1.5 });
      const vD = graph.createVertex('D', { weight: 1.5 });
      const vE = graph.createVertex('E', { weight: 1.5 });
      const vF = graph.createVertex('F', { weight: 2 });
      const vG = graph.createVertex('G', { weight: 2 });

      graph.createEdge(Vertex.idFromName('Start'), vA, { label: 'design', weight: 2 });
      graph.createEdge(vA, vB, { label: 'build body' });
      graph.createEdge(vA, vC, { label: 'build wheels' });
      graph.createEdge(vA, vD, { label: 'build frame' });
      graph.createEdge(vA, vE, { label: 'build engine' });
      graph.createEdge(vB, vF, { label: 'paint body' });
      graph.createEdge(vD, vG, { label: 'paint frame' });
      graph.createEdge(vC, Vertex.idFromName('Finish'), { label: 'mount wheels' });
      graph.createEdge(vE, vG, { label: 'mount engine on frame' });
      graph.createEdge(vF, Vertex.idFromName('Finish'), { label: 'mount body on frame' });
      graph.createEdge(vG, Vertex.idFromName('Finish'));

      let emb = Embedding.forGraph(graph);

      emb.setVertexPosition(Vertex.idFromName('Start'), new Point2D(50, 200));
      emb.setVertexPosition(vA, new Point2D(200, 200));
      emb.setVertexPosition(vB, new Point2D(350, 50));
      emb.setVertexPosition(vC, new Point2D(350, 150));
      emb.setVertexPosition(vD, new Point2D(350, 250));
      emb.setVertexPosition(vE, new Point2D(350, 350));
      emb.setVertexPosition(vF, new Point2D(500, 100));
      emb.setVertexPosition(vG, new Point2D(600, 300));
      emb.setVertexPosition(Vertex.idFromName('Finish'), new Point2D(650, 200));

      let vClasses = {
        '"Start"': ['start'],
        '"Finish"': ['finish', 'body', 'wheels', 'frame', 'engine'],
        [vA]: ['init'],
        [vB]: ['build', 'body'],
        [vC]: ['build', 'wheels'],
        [vD]: ['build', 'frame'],
        [vE]: ['build', 'engine'],
        [vF]: ['paint', 'body'],
        [vG]: ['mount', 'body', 'frame', 'engine']
      };

      console.log(emb.toSvg(700, 400, { verticesCss: vClasses, drawEdgesAsArcs: true }));
    });

    it('# Regex FSA should return a valid svg', () => {
      let graph = new Graph();
      const start = graph.getVertex(graph.createVertex('Start', { weight: 2 }));
      const endValidated = graph.getVertex(graph.createVertex('OK', { weight: 2 }));
      const endError = graph.getVertex(graph.createVertex('Error', { weight: 2 }));
      const s0 = graph.getVertex(graph.createVertex('S0', { weight: 1.5 }));
      const s1 = graph.getVertex(graph.createVertex('S1', { weight: 1.5 }));
      const s2 = graph.getVertex(graph.createVertex('S2', { weight: 1.5 }));
      const s3 = graph.getVertex(graph.createVertex('S3', { weight: 1.5 }));
      const s4 = graph.getVertex(graph.createVertex('S4', { weight: 1.5 }));
      const s5 = graph.getVertex(graph.createVertex('S5', { weight: 1.5 }));

      let edgeStart = graph.getEdge(graph.createEdge(start, s0, { weight: 3, label: '^' }));
      let edgeS0S1 = graph.getEdge(graph.createEdge(s0, s1, { label: "[a-z0-9]" }));
      let edgeS1Loop = graph.getEdge(graph.createEdge(s1, s1, { label: "[a-z0-9_]" }));
      graph.createEdge(s1, s2, { label: '"@"' });
      graph.createEdge(s2, s3, { label: "[a-z0-9]" });
      graph.createEdge(s3, s3, { label: "[a-z0-9_]" });
      graph.createEdge(s3, s4, { label: '"."' });
      let edgeS4S5 = graph.getEdge(graph.createEdge(s4, s5, { label: "[a-z0-9]" }));
      let edgeS5Loop = graph.getEdge(graph.createEdge(s5, s5, { label: "[a-z0-9_]" }));
      let edgeS5S4 = graph.getEdge(graph.createEdge(s5, s4, { label: '"."' }));
      let edgeEnd = graph.getEdge(graph.createEdge(s5, endValidated, { label: '$' }));

      let edgeS0Error = graph.getEdge(graph.createEdge(s0, endError, { label: '[^a-z0-9]' }));
      let edgeS1Error = graph.getEdge(graph.createEdge(s1, endError, { label: '[^a-z0-9_@]' }));
      let edgeS2Error = graph.getEdge(graph.createEdge(s2, endError, { label: "[^a-z0-9]" }));
      let edgeS3Error = graph.getEdge(graph.createEdge(s3, endError, { label: "[^a-z0-9_\\.]" }));
      let edgeS4Error = graph.getEdge(graph.createEdge(s4, endError, { label: '[^a-z0-9]' }));
      let edgeS5Error = graph.getEdge(graph.createEdge(s5, endError, { label: '[^a-z0-9_\\.]' }));

      let emb = Embedding.forGraph(graph, { width: 700, height: 400 });

      // Set the position of each vertex
      emb.setVertexPosition(start, new Point2D(50, 150));
      emb.setVertexPosition(s0, new Point2D(100, 300));
      emb.setVertexPosition(s1, new Point2D(175, 100));
      emb.setVertexPosition(s2, new Point2D(275, 250));
      emb.setVertexPosition(s3, new Point2D(350, 100));
      emb.setVertexPosition(s4, new Point2D(425, 250));
      emb.setVertexPosition(s5, new Point2D(550, 100));
      emb.setVertexPosition(endValidated, new Point2D(650, 250));
      emb.setVertexPosition(endError, new Point2D(350, 500));

      // Adjust the curvature of some edges
      emb.setEdgeControlPoint(edgeStart, -10);
      emb.setEdgeControlPoint(edgeS0S1, 60);
      emb.setEdgeControlPoint(edgeS4S5, 70);
      emb.setEdgeControlPoint(edgeS5S4, 70);
      emb.setEdgeControlPoint(edgeS1Loop, 20);
      emb.setEdgeControlPoint(edgeS5Loop, 20);

      emb.setEdgeControlPoint(edgeS0Error, -80);
      emb.setEdgeControlPoint(edgeS1Error, -120);
      emb.setEdgeControlPoint(edgeS2Error, -40);
      emb.setEdgeControlPoint(edgeS3Error, 0);
      emb.setEdgeControlPoint(edgeS4Error, 40);
      emb.setEdgeControlPoint(edgeS5Error, 175);

      // Vertices/edges can be styled individually by applying them css classes
      let vCss = {
        [start.id]: ['start'],
        [endValidated.id]: ['end'],
        [endError.id]: ['end', 'error']
      };
      let eCss = {
        [edgeStart.id]: ['start'],
        [edgeEnd.id]: ['end'],
        [edgeS0Error.id]: ['end', 'error'],
        [edgeS1Error.id]: ['end', 'error'],
        [edgeS2Error.id]: ['end', 'error'],
        [edgeS3Error.id]: ['end', 'error'],
        [edgeS4Error.id]: ['end', 'error'],
        [edgeS5Error.id]: ['end', 'error']
      };

      console.log(emb.toSvg(700, 550, {
        graphCss: ['FSA'],
        verticesCss: vCss,
        edgesCss: eCss,
        drawEdgesAsArcs: true,
        displayEdgesWeight: false
      }));
    });

  });
});