import 'mjs-mocha';

import Edge from '../../src/graph/edge.js';
import Graph from '../../src/graph/graph.js';
import Vertex from '../../src/graph/vertex.js';
import { choose } from '../../src/common/array.js';
import { randomInt } from '../../src/common/numbers.js';
import { testAPI, testStaticAPI } from '../utils/test_common.js';

import chai from "chai";
import should from "should";

const expect = chai.expect;

describe('Graph API', () => {

  it('# Class should have a constructor method', function () {
    Graph.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = ['fromJson', 'fromJsonObject'];
    testStaticAPI(Graph, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let edge = new Graph();
    let methods = ['constructor', 'toJson', 'equals',
      'createVertex', 'addVertex', 'hasVertex',
      'createEdge', 'addEdge', 'hasEdge'];
    let attributes = ['vertices', 'edges', 'size'];
    testAPI(edge, attributes, methods);
  });
});

describe('equals()', () => {
  it('# Class should have a static fromJson method', function () {
    let staticMethods = ['fromJson', 'fromJsonObject'];
    testStaticAPI(Graph, staticMethods);
  });
});

describe('equals()', () => {

  function createExampleGraph() {
    let g = new Graph();
    let v1 = 'a random unicòde string ☺';
    let v2 = 1;
    let v3 = -3.1415;
    let v4 = { 'what': -3 };
    let v5 = [1, true, -3];


    g.createVertex(v1);
    g.createVertex(v2);
    g.createVertex(v3);
    g.createVertex(v4);
    g.createVertex(v5);
    g.createEdge(v1, v2, { label: 'label', weight: -0.1e14 });
    g.createEdge(v3, v4, { weight: 33 });
    g.createEdge(v3, v5, { weight: 0 });
    return g;
  }

  function createRandomGraph(minV, maxV, minE, maxE) {
    let g = new Graph();
    let numVertices = randomInt(minV, maxV);
    let numEdges = randomInt(minE, maxE);

    for (let i = 0; i < numVertices; i++) {
      g.createVertex(i);
    }

    for (let j = 0; j < numEdges; j++) {
      let v = randomInt(0, numVertices);
      let u = randomInt(0, numVertices);
      g.createEdge(u, v, { weight: Math.random() });
    }
    return g;
  }

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
  const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
  it('# should return a valid json', () => {
    labels.forEach(label => {
      const dest = choose(labels);
      const edgeLabel = choose(labels);
      const weight = Math.random();
      let e = new Edge(label, dest, { label: edgeLabel, weight: weight });
      let v = new Vertex(label, { size: Math.random(), outgoingEdges: [e] });
    });
  });

  it('# should stringify the fields consistently and deep-stringify all the fields', () => {
    let g = new Graph();
    let v1 = 'abc';
    let v2 = 1;
    let v3 = 3.1415;
    let v4 = { 'what': -3 };


    g.createVertex(v1);
    g.createVertex(v2);
    g.createVertex(v3);
    g.createVertex(v4);
    g.createEdge(v1, v2, { label: 'label', weight: -0.1e14 });
    g.createEdge(v3, v4, { weight: 33 });

    expect(() => JSON.parse(g.toJson())).not.to.throw();

    g.toJson().should.eql('{"vertices":["{\\"label\\":\\"abc\\",\\"size\\":1}","{\\"label\\":1,\\"size\\":1}","{\\"label\\":3.1415,\\"size\\":1}","{\\"label\\":{\\"what\\":-3},\\"size\\":1}"],"edges":["{\\"destination\\":1,\\"label\\":\\"label\\",\\"source\\":\\"abc\\",\\"weight\\":-10000000000000}","{\\"destination\\":{\\"what\\":-3},\\"label\\":null,\\"source\\":3.1415,\\"weight\\":33}"]}');
  });
});

describe('fromJsonObject()', () => {
  const g = new Graph();
  let v1 = 'abc';
  let v2 = 1;
  let v3 = 3.1415;
  let v4 = { 'what': -3 };

  g.createVertex(v1);
  g.createVertex(v2);
  g.createVertex(v3);
  g.createVertex(v4);
  g.createEdge(v1, v2, { label: 'label', weight: -0.1e14 });
  g.createEdge(v3, v4, { weight: 33 });
  g.createEdge(v3, v1, { weight: 33, label: 'edge' });

  it('# applyed to the result of toJson, it should match source graph ', () => {
    Graph.fromJsonObject(JSON.parse(g.toJson())).should.eql(g);
  });
});

describe('fromJson()', () => {
  const g = new Graph();
  let v1 = 'abc';
  let v2 = 1;
  let v3 = 3.1415;
  let v4 = { 'what': -3 };

  g.createVertex(v1);
  g.createVertex(v2);
  g.createVertex(v3);
  g.createVertex(v4);
  g.createEdge(v1, v2, { label: 'label', weight: -0.1e14 });
  g.createEdge(v3, v4, { weight: 33 });
  g.createEdge(v3, v1, { weight: 33, label: 'edge' });

  it('# applyed to the result of toJson, it should match source graph ', () => {
    Graph.fromJson(g.toJson()).should.eql(g);
  });
});