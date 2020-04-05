import 'mjs-mocha';

import Edge from '../../src/graph/edge.mjs';
import Graph from '../../src/graph/graph.mjs';
import Vertex from '../../src/graph/vertex.mjs';
import { choose } from '../../src/common/array.mjs';
import { randomInt } from '../../src/common/numbers.mjs';
import { testAPI, testStaticAPI } from '../utils/test_common.mjs';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_DUPLICATED, ERROR_MSG_VERTEX_NOT_FOUND, ERROR_MSG_EDGE_NOT_FOUND } from '../../src/common/errors.mjs'

import chai from "chai";
import should from "should";
import { range } from '../../src/common/numbers.mjs';
import { isObject } from '../../src/common/basic.mjs';
import { UndirectedGraph } from '../../src/graph/graph.mjs';
import BfsResult from '../../src/graph/algo/bfs.mjs';

const expect = chai.expect;

function createExampleGraph() {
  let g = new Graph();
  const v1 = g.createVertex('a random unicòde string ☺');
  const v2 = g.createVertex(1, { weight: -21 });
  const v3 = g.createVertex(-3.1415);
  const v4 = g.createVertex({ 'what': -3 });
  const v5 = g.createVertex([1, true, -3]);

  g.createEdge(g.getVertex(v1), g.getVertex(v2), { label: 'label', weight: -0.1e14 });
  g.createEdge(g.getVertex(v3), g.getVertex(v4), { weight: 33 });
  g.createEdge(g.getVertex(v3), g.getVertex(v5));
  return g;
}

function createRandomGraph(minV, maxV, minE, maxE) {
  let g = new Graph();
  const numVertices = randomInt(minV, maxV);
  const numEdges = randomInt(minE, maxE);

  for (let i = 0; i < numVertices; i++) {
    g.createVertex(i);
  }

  for (let j = 0; j < numEdges; j++) {
    let v = randomInt(0, numVertices);
    let u = randomInt(0, numVertices);
    g.createEdge(Vertex.idFromLabel(u), Vertex.idFromLabel(v), { weight: Math.random() });
  }
  return g;
}

describe('Graph API', () => {

  it('# Class should have a constructor method', () => {
    Graph.should.be.a.constructor();
  });

  it('# should have static methods availabel', () => {
    let staticMethods = ['fromJson', 'fromJsonObject', 'completeGraph', 'completeBipartiteGraph'];
    testStaticAPI(Graph, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let edge = new Graph();
    let methods = ['constructor', 'toJson', 'toJsonObject', 'equals', 'clone', 'isDirected',
      'createVertex', 'addVertex', 'hasVertex', 'getVertex', 'getVertexWeight', 'getVertexOutDegree',
      'setVertexWeight', 'createEdge', 'addEdge', 'hasEdge', 'hasEdgeBetween', 'getEdge', 'getEdgeBetween', 'getEdgesInPath',
      'getEdgeLabel', 'getEdgeWeight', 'setEdgeWeight',
      'bfs'];
    let attributes = ['vertices', 'edges'];
    testAPI(edge, attributes, methods);
  });
});

describe('createVertex()', () => {
  const labels = [1, '65.231', 'adbfhs', false, [], { a: 'x' }, { 'a': [true, { false: 3.0 }] }];
  it('# should add all valid label types', () => {
    let g = new Graph();
    labels.forEach(label => {
      g.createVertex(label, { weight: Math.random() });
    });

    labels.forEach(label => {
      g.hasVertex(Vertex.idFromLabel(label)).should.be.true();
    });
  });

  it('# should throw on duplicates', () => {
    let g = new Graph();
    labels.forEach(label => {
      g.createVertex(label, { weight: Math.random() });
    });
    // Try to add each label once more
    labels.forEach(label => {
      expect(() => g.createVertex(label, { weight: Math.random() })).to.throw(ERROR_MSG_VERTEX_DUPLICATED('Graph.createVertex', label));
    });
  });
});

describe('addVertex()', () => {
  const vertices = [1, '65.231', 'adbfhs', false, [], { a: 'x' }, { 'a': [true, { false: 3.0 }] }].map(v => new Vertex(v));
  it('# should add all valid label types', () => {
    let g = new Graph();
    vertices.forEach(v => {
      g.addVertex(v);
    });

    vertices.forEach(v => {
      g.hasVertex(v).should.be.true();
    });
  });

  it('# should throw on duplicates', () => {
    let g = new Graph();
    vertices.forEach(v => {
      g.addVertex(v);
    });
    // Try to add each label once more
    vertices.forEach(v => {
      expect(() => g.addVertex(v)).to.throw(ERROR_MSG_VERTEX_DUPLICATED('Graph.addVertex', v));
    });
  });
});

describe('getVertexWeight', () => {
  const g = createExampleGraph();

  it('# Should retrieve the right weight', () => {
    g.getVertexWeight(Vertex.idFromLabel(1)).should.eql(-21);
    // defaults to 1 when not explicitly set
    g.getVertexWeight(Vertex.idFromLabel('a random unicòde string ☺')).should.eql(1);
    g.getVertexWeight(Vertex.idFromLabel({ 'what': -3 })).should.eql(1);
  });

  it('# Should return undefined when the graph does not have a vertex', () => {
    expect(g.getVertexWeight('not here')).to.be.undefined;
    expect(g.getVertexWeight(2)).to.be.undefined;
  });
});

describe('createEdge()', () => {
  const labels = [1, '65.231', 'adbfhs', false, [], { a: 'x' }, { 'a': [true, { false: 3.0 }] }];
  const ids = labels.map(Vertex.idFromLabel);

  it('# should add all valid label types', () => {
    let g = new Graph();
    labels.forEach(label => {
      g.createVertex(label, { weight: Math.random() });
    });

    g.createEdge(ids[1], ids[5]);
    let e = g.getEdgeBetween(ids[1], ids[5]);
    e.source.label.should.eql(labels[1]);
    e.destination.label.should.eql(labels[5]);
    g.hasEdge(e).should.be.true();

    e = g.getEdge(g.createEdge(ids[0], ids[6], { weight: 5, label: 'edge label' }));

    e.source.label.should.eql(labels[0]);
    e.destination.label.should.eql(labels[6]);
    e.weight.should.eql(5);
    e.label.should.eql('edge label');
    g.hasEdge(e).should.be.true();

    e = new Edge(new Vertex(labels[0]), new Vertex(labels[2]));
    g.hasEdge(e).should.be.false();

    g.hasEdgeBetween(ids[0], ids[6]).should.be.true();
    g.hasEdgeBetween(ids[6], ids[0]).should.be.false();
    g.hasEdgeBetween(ids[1], ids[5]).should.be.true();
    g.hasEdgeBetween(ids[5], ids[1]).should.be.false();
    g.hasEdgeBetween(ids[0], ids[2]).should.be.false();
    g.hasEdgeBetween(ids[2], ids[0]).should.be.false();
  });

  it('# should throw when vertices are not in the graph', () => {
    let g = new Graph();
    labels.forEach(label => {
      g.createVertex(label, { weight: Math.random() });
    });
    expect(() => g.createEdge('v', ids[0])).to.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', 'v'));
    expect(() => g.createEdge(ids[0], 'u')).to.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', 'u'));
  });
});

describe('addEdge()', () => {
  const sources = [1, '65.231', 'adbfhs', false, [], { a: 'x' }, { 'a': [true, { false: 3.0 }] }].map(lab => new Vertex(lab));
  it('# should add all valid label types', () => {
    let g = new Graph();
    sources.forEach(v => {
      g.addVertex(v, { weight: Math.random() });
    });

    let expected = new Edge(sources[0], sources[2]);
    let e = g.getEdge(g.addEdge(expected));
    expected.equals(e).should.be.true();

    g.hasEdge(expected).should.be.true();
  });

  it('# should throw when vertices are not in the graph', () => {
    let g = new Graph();
    sources.forEach(v => {
      g.addVertex(v, { weight: Math.random() });
    });
    let e1 = new Edge(new Vertex('a'), sources[0]);
    let e2 = new Edge(sources[1], new Vertex(-Math.random()));
    expect(() => g.addEdge(e1)).to.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.addEdge', e1.source));
    expect(() => g.addEdge(e2)).to.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.addEdge', e2.destination));
  });
});

describe('getEdgeLabel', () => {
  const g = createExampleGraph();

  it('# Should retrieve the right label', () => {
    g.getEdgeLabel(Vertex.idFromLabel('a random unicòde string ☺'), Vertex.idFromLabel(1)).should.eql('label');
  });

  it('# Should return undefined when edge does not have a label', () => {
    g.hasEdgeBetween(Vertex.idFromLabel(-3.1415), Vertex.idFromLabel({ 'what': -3 })).should.be.true();
    expect(g.getEdgeLabel(Vertex.idFromLabel(-3.1415), Vertex.idFromLabel({ 'what': -3 }))).to.be.undefined;
  });

  it('# Should return undefined when edge does not exist', () => {
    expect(g.getEdgeLabel(1, 'a random unicòde string ☺')).to.be.undefined;
    expect(g.getEdgeLabel('not in graph', 1)).to.be.undefined;
    expect(g.getEdgeLabel(3, 2)).to.be.undefined;
  });
});

describe('getEdgeWeight', () => {
  const g = createExampleGraph();

  it('# Should retrieve the right weight', () => {
    g.getEdgeWeight(Vertex.idFromLabel('a random unicòde string ☺'), Vertex.idFromLabel(1)).should.eql(-0.1e14);
    g.getEdgeWeight(Vertex.idFromLabel(-3.1415), Vertex.idFromLabel({ 'what': -3 })).should.eql(33);

  });

  it('# Should default to 1 (when edge weight is not set explicitly)', () => {
    g.hasEdgeBetween(Vertex.idFromLabel(-3.1415), Vertex.idFromLabel([1, true, -3])).should.be.true();
    g.getEdgeWeight(Vertex.idFromLabel(-3.1415), Vertex.idFromLabel([1, true, -3])).should.eql(1);
  });

  it('# Should return undefined when edge does not exist', () => {
    expect(g.getEdgeWeight(1, 'a random unicòde string ☺')).to.be.undefined;
    expect(g.getEdgeWeight('not in graph', 1)).to.be.undefined;
    expect(g.getEdgeWeight(3, 2)).to.be.undefined;
  });
});

describe('getEdgesInPath()', () => {
  let g = new Graph();

  before(() => {
    range(1, 8).forEach(i => g.createVertex(`${i}`));
    g.createEdge('"1"', '"2"');
    g.createEdge('"1"', '"3"');
    g.createEdge('"2"', '"3"');
    g.createEdge('"2"', '"4"');
    g.createEdge('"3"', '"5"');
    g.createEdge('"4"', '"1"');
    g.createEdge('"6"', '"7"');
  })

  it('# should throw when the wrong argument type is passed', () => {
    (() => g.getEdgesInPath(null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Graph.getEdgesInPath', 'verticesSequence', null));
    (() => g.getEdgesInPath()).should.throw(ERROR_MSG_INVALID_ARGUMENT('Graph.getEdgesInPath', 'verticesSequence', undefined));
    (() => g.getEdgesInPath({})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Graph.getEdgesInPath', 'verticesSequence', {}));
  });

  it('# should throw when the path is not in the graph', () => {
    (() => g.getEdgesInPath(['"1"', '"8"'])).should.throw(ERROR_MSG_EDGE_NOT_FOUND('Graph.getEdgesInPath', `"1"->"8"`));
    (() => g.getEdgesInPath(['"a"', '"2"'])).should.throw(ERROR_MSG_EDGE_NOT_FOUND('Graph.getEdgesInPath', `"a"->"2"`));
    (() => g.getEdgesInPath(['"3"', '"5"', '"7"'])).should.throw(ERROR_MSG_EDGE_NOT_FOUND('Graph.getEdgesInPath', `"5"->"7"`));
  });

  it('# should not throw with empty path', () => {
    g.getEdgesInPath([]).should.eql([]);
  });

  it('# should reconstruct a path', () => {
    let path = g.getEdgesInPath(['"1"', '"2"', '"4"']);
    Array.isArray(path).should.be.true();
    path.length.should.eql(2);
    path.every(e => e instanceof Edge).should.be.true();
    path[0].source.id.should.eql('"1"');
    path[0].destination.id.should.eql('"2"');
    path[1].source.id.should.eql('"2"');
    path[1].destination.id.should.eql('"4"');

    path = g.getEdgesInPath(['"1"', '"2"', '"4"', '"1"', '"3"']);
    Array.isArray(path).should.be.true();
    path.length.should.eql(4);
    path.every(e => e instanceof Edge).should.be.true();
    path[0].source.id.should.eql('"1"');
    path[0].destination.id.should.eql('"2"');
    path[1].source.id.should.eql('"2"');
    path[1].destination.id.should.eql('"4"');
    path[2].source.id.should.eql('"4"');
    path[2].destination.id.should.eql('"1"');
    path[3].source.id.should.eql('"1"');
    path[3].destination.id.should.eql('"3"');

    path = g.getEdgesInPath(['"6"', '"7"']);
    Array.isArray(path).should.be.true();
    path.length.should.eql(1);
    path.every(e => e instanceof Edge).should.be.true();
    path[0].source.id.should.eql('"6"');
    path[0].destination.id.should.eql('"7"');
  });
});

describe('equals()', () => {
  it('# should abide by reflexive property', () => {
    let g = createExampleGraph();
    g.equals(g).should.be.true();
  });

  it('# should abide by transitive property', () => {
    let g1 = createExampleGraph();
    let g2 = createExampleGraph();
    let g3 = createExampleGraph();
    let g4 = createRandomGraph(6, 7, 2, 10);
    g1.equals(g2).should.be.true();
    g2.equals(g3).should.be.true();
    g1.equals(g3).should.be.true();

    g1.equals(g4).should.eql(g2.equals(g4));
  });

  it('# should abide by symmetric property', () => {
    let g1 = createExampleGraph();
    let g2 = createExampleGraph();
    let g3 = createRandomGraph(6, 7, 2, 10);
    g1.equals(g2).should.be.true();
    g2.equals(g1).should.be.true();
    g1.equals(g3).should.be.false();
    g3.equals(g1).should.be.false();
  });

});

describe('toJson()', () => {
  const sources = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'].map(label => new Vertex(label));
  const labels = ['', '1', '-1e14', 'test n° 1', 'unicode ☻'];
  it('# should return a valid json', () => {
    sources.forEach(source => {
      let g = new Graph();
      const dest = choose(sources);
      const edgeLabel = choose(labels);
      const weight = Math.random();
      let e = new Edge(source, dest, { label: edgeLabel, weight: weight });
      let u = new Vertex(source.label, { weight: Math.random(), outgoingEdges: [e] });
      let v = new Vertex(dest.label, { weight: Math.random() });
      g.addVertex(u);
      if (v.id != u.id) {
        g.addVertex(v);
      }
      g.addEdge(e);

      expect(() => JSON.parse(g.toJson())).not.to.throw();
    });
  });

  it('# should stringify the fields consistently and deep-stringify all the fields', () => {
    let g = new Graph();
    let v1 = g.createVertex('abc');
    let v2 = g.createVertex(1);
    let v3 = g.createVertex(3.1415);
    let v4 = g.createVertex({ 'what': -3 });

    g.createEdge(v1, v2, { label: 'label', weight: -0.1e14 });
    g.createEdge(v3, v4, { weight: 33 });

    expect(() => JSON.parse(g.toJson())).not.to.throw();
    JSON.parse(g.toJson()).should.eql(
      {
        vertices: [{ label: "abc", weight: 1 }, { label: 1, weight: 1 }, { label: 3.1415, weight: 1 }, { label: { what: -3 }, weight: 1 }],
        edges: [
          { source: { label: "abc", weight: 1 }, destination: { label: 1, weight: 1 }, label: "label", weight: -10000000000000 },
          { source: { label: 3.1415, weight: 1 }, destination: { label: { what: -3 }, weight: 1 }, weight: 33 }]
      });
  });
});

describe('clone()', () => {
  it('# should clone the graph correctly', () => {
    let g = createRandomGraph(8, 11, 3, 15);
    g.clone().equals(g).should.be.true();
  });

  it('# modifying deep clones should not affect originals', () => {
    let g = new Graph();

    let label1 = { 'what': -3 };
    let label2 = [1, true, -3];
    let v1 = g.createVertex(label1);
    let v2 = g.createVertex(label2);

    g.createEdge(v1, v2);
    let g1 = g.clone();

    label1['new'] = true;

    g.hasVertex(Vertex.idFromLabel(label1)).should.be.false();
    g1.hasVertex(Vertex.idFromLabel(label1)).should.be.false();
    g.hasVertex(Vertex.idFromLabel({ 'what': -3 })).should.be.true();
    g1.hasVertex(Vertex.idFromLabel({ 'what': -3 })).should.be.true();
  });
});

describe('fromJsonObject()', () => {
  const g = new Graph();
  const v1 = g.createVertex('abc');
  const v2 = g.createVertex(1);
  const v3 = g.createVertex(3.1415);
  const v4 = g.createVertex({ 'what': -3 });

  g.createEdge(v1, v2, { label: 'label', weight: -0.1e14 });
  g.createEdge(v3, v4, { weight: 33 });
  g.createEdge(v3, v1, { weight: 33, label: 'edge' });

  it('# applyed to the result of toJson, it should match source graph ', () => {
    Graph.fromJsonObject(JSON.parse(g.toJson())).should.eql(g);
  });
});

describe('fromJson()', () => {
  const g = new Graph();
  const v1 = g.createVertex('abc');
  const v2 = g.createVertex({ 'a': [true, { false: 3.0 }] });
  const v3 = g.createVertex(3.1415);
  const v4 = g.createVertex({ 'what': -3 });

  g.createEdge(v1, v2, { label: 'label', weight: -0.1e14 });
  g.createEdge(v3, v4, { weight: 33 });
  g.createEdge(v3, v1, { weight: 33, label: 'edge' });

  it('# applyed to the result of toJson, it should match source graph ', () => {
    const g1 = Graph.fromJson(g.toJson());

    g1.equals(g).should.be.true();
    g1.hasVertex(v2).should.be.true();
    g1.hasVertex(v4).should.be.true();
    g1.hasVertex(new Vertex('def')).should.be.false();
  });
});

describe('Algorithms', () => {
  describe('bfs', () => {
    describe('# UndirectedGraph', () => {
      it('Invalid input should return error', () => {
        let g = new UndirectedGraph();
        (() => g.bfs('NotAVertex')).should.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.bfs', 'NotAVertex'));
      });

      it('should compute bfs on a connected graph', () => {
        let g = new UndirectedGraph();
        range(1, 6).forEach(i => g.createVertex(`${i}`));
        g.createEdge('"1"', '"2"');
        g.createEdge('"1"', '"3"');
        g.createEdge('"2"', '"3"');
        g.createEdge('"2"', '"4"');
        g.createEdge('"3"', '"5"');
        g.createEdge('"4"', '"1"');

        const bfs = g.bfs('"1"');

        isObject(bfs).should.be.true();
        (bfs instanceof BfsResult).should.be.true();

        Object.keys(bfs.predecessor).sort().should.eql(['"1"', '"2"', '"3"', '"4"', '"5"']);
        (() => bfs.predecessor['"1"']).should.be.null;
        bfs.predecessor['"2"'].should.equal('"1"');
        bfs.predecessor['"3"'].should.equal('"1"');
        bfs.predecessor['"4"'].should.equal('"1"');
        bfs.predecessor['"5"'].should.equal('"3"');

        Object.keys(bfs.distance).sort().should.eql(['"1"', '"2"', '"3"', '"4"', '"5"']);
        bfs.distance['"1"'].should.equal(0);
        bfs.distance['"2"'].should.equal(1);
        bfs.distance['"3"'].should.equal(1);
        bfs.distance['"4"'].should.equal(1);
        bfs.distance['"5"'].should.equal(2);
      });

      it('should compute bfs on a disconnected graph', () => {
        let g = new UndirectedGraph();
        range(1, 8).forEach(i => g.createVertex(`${i}`));
        g.createEdge('"1"', '"2"');
        g.createEdge('"1"', '"3"');
        g.createEdge('"2"', '"3"');
        g.createEdge('"2"', '"4"');
        g.createEdge('"3"', '"5"');
        g.createEdge('"4"', '"1"');
        g.createEdge('"6"', '"7"');

        const bfs = g.bfs('"1"');

        isObject(bfs).should.be.true();
        (bfs instanceof BfsResult).should.be.true();

        Object.keys(bfs.predecessor).sort().should.eql(['"1"', '"2"', '"3"', '"4"', '"5"']);
        (() => bfs.predecessor['"1"']).should.be.null;
        bfs.predecessor['"2"'].should.equal('"1"');
        bfs.predecessor['"3"'].should.equal('"1"');
        bfs.predecessor['"4"'].should.equal('"1"');
        bfs.predecessor['"5"'].should.equal('"3"');
        (() => bfs.predecessor['"6"']).should.be.undefined;
        (() => bfs.predecessor['"7"']).should.be.undefined;

        Object.keys(bfs.distance).sort().should.eql(['"1"', '"2"', '"3"', '"4"', '"5"', '"6"', '"7"']);
        bfs.distance['"1"'].should.equal(0);
        bfs.distance['"2"'].should.equal(1);
        bfs.distance['"3"'].should.equal(1);
        bfs.distance['"4"'].should.equal(1);
        bfs.distance['"5"'].should.equal(2);
        bfs.distance['"6"'].should.equal(Infinity);
        bfs.distance['"7"'].should.equal(Infinity);
      });
    });

    describe('# DirectedGraph', () => {
      it('Invalid input should return error', () => {
        let g = new Graph();
        (() => g.bfs('NotAVertex')).should.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.bfs', 'NotAVertex'));
      });

      it('should compute bfs on a connected di-graph', () => {
        let g = new Graph();
        range(1, 6).forEach(i => g.createVertex(`${i}`));
        g.createEdge('"1"', '"2"');
        g.createEdge('"1"', '"3"');
        g.createEdge('"2"', '"3"');
        g.createEdge('"2"', '"4"');
        g.createEdge('"3"', '"5"');
        g.createEdge('"4"', '"1"');

        const bfs = g.bfs('"1"');

        isObject(bfs).should.be.true();
        (bfs instanceof BfsResult).should.be.true();

        Object.keys(bfs.predecessor).sort().should.eql(['"1"', '"2"', '"3"', '"4"', '"5"']);
        (() => bfs.predecessor['"1"']).should.be.null;
        bfs.predecessor['"2"'].should.equal('"1"');
        bfs.predecessor['"3"'].should.equal('"1"');
        bfs.predecessor['"4"'].should.equal('"2"');
        bfs.predecessor['"5"'].should.equal('"3"');

        Object.keys(bfs.distance).sort().should.eql(['"1"', '"2"', '"3"', '"4"', '"5"']);
        bfs.distance['"1"'].should.equal(0);
        bfs.distance['"2"'].should.equal(1);
        bfs.distance['"3"'].should.equal(1);
        bfs.distance['"4"'].should.equal(2);
        bfs.distance['"5"'].should.equal(2);
      });

      it('should build the correct path', () => {
        let g = new Graph();
        range(1, 7).forEach(i => g.createVertex(`${i}`));
        g.createEdge('"1"', '"2"');
        g.createEdge('"1"', '"3"');
        g.createEdge('"2"', '"3"');
        g.createEdge('"2"', '"4"');
        g.createEdge('"3"', '"5"');
        g.createEdge('"4"', '"1"');

        const bfs = g.bfs('"4"');

        let path = g.getEdgesInPath(bfs.reconstructPathTo('"3"'));

        path.length.should.eql(2);
        path.every(e => e instanceof Edge).should.be.true();
        path[0].source.id.should.eql('"4"');
        path[0].destination.id.should.eql('"1"');
        path[1].source.id.should.eql('"1"');
        path[1].destination.id.should.eql('"3"');

        path = g.getEdgesInPath(bfs.reconstructPathTo('"5"'));

        path.length.should.eql(3);
        path.every(e => e instanceof Edge).should.be.true();
        path[0].source.id.should.eql('"4"');
        path[0].destination.id.should.eql('"1"');
        path[1].source.id.should.eql('"1"');
        path[1].destination.id.should.eql('"3"');
        path[2].source.id.should.eql('"3"');
        path[2].destination.id.should.eql('"5"');

        // Unreachable vertex
        path = g.getEdgesInPath(bfs.reconstructPathTo('"6"'));
        path.length.should.eql(0);

        // Vertex not in graph
        path = g.getEdgesInPath(bfs.reconstructPathTo('"a"'));
        path.length.should.eql(0);
      });
    });
  });
});