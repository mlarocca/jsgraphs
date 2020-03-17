import 'mjs-mocha';

import Edge from '../../src/graph/edge.js';
import Graph from '../../src/graph/graph.js';
import Vertex from '../../src/graph/vertex.js';
import { choose } from '../../src/common/array.js';
import { randomInt } from '../../src/common/numbers.js';
import { testAPI, testStaticAPI } from '../utils/test_common.js';
import { ERROR_MSG_VERTEX_DUPLICATED, ERROR_MSG_VERTEX_NOT_FOUND } from '../../src/common/errors.js'

import chai from "chai";
import should from "should";

const expect = chai.expect;

function createExampleGraph() {
  let g = new Graph();
  let v1 = 'a random unicòde string ☺';
  let v2 = 1;
  let v3 = -3.1415;
  let v4 = { 'what': -3 };
  let v5 = [1, true, -3];

  g.createVertex(v1);
  g.createVertex(v2, { weight: -21 });
  g.createVertex(v3);
  g.createVertex(v4);
  g.createVertex(v5);
  g.createEdge(v1, v2, { label: 'label', weight: -0.1e14 });
  g.createEdge(v3, v4, { weight: 33 });
  g.createEdge(v3, v5);
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
    let methods = ['constructor', 'toJson', 'equals', 'clone',
      'createVertex', 'addVertex', 'hasVertex', 'getVertex', 'getVertexWeight', 'getVertexOutDegree',
      'createEdge', 'addEdge', 'hasEdge', 'getEdge', 'hasEdgeBetween', 'getEdgeWeight', 'getEdgeLabel'];
    let attributes = ['vertices', 'edges'];
    testAPI(edge, attributes, methods);
  });
});

describe('createVertex()', () => {
  const labels = [1, '65.231', 'adbfhs', false, [], { a: 'x' }, { 'a': [true, { false: 3.0 }] }];
  it('# should add all valid label types', function () {
    let g = new Graph();
    labels.forEach(label => {
      g.createVertex(label, { weight: Math.random() });
    });

    labels.forEach(label => {
      g.hasVertex(label).should.be.true();
    });
  });

  it('# should throw on duplicates', function () {
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
  it('# should add all valid label types', function () {
    let g = new Graph();
    vertices.forEach(v => {
      g.addVertex(v);
    });

    vertices.forEach(v => {
      g.hasVertex(v).should.be.true();
    });
  });

  it('# should throw on duplicates', function () {
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

  it('# Should retrieve the right weight', function () {
    g.getVertexWeight(1).should.eql(-21);
    // defaults to 1 when not explicitly set
    g.getVertexWeight('a random unicòde string ☺').should.eql(1);
    g.getVertexWeight({ 'what': -3 }).should.eql(1);
  });

  it('# Should return undefined when the graph does not have a vertex', function () {
    expect(g.getVertexWeight('not here')).to.be.undefined;
    expect(g.getVertexWeight(2)).to.be.undefined;
  });
});

describe('createEdge()', () => {
  const labels = [1, '65.231', 'adbfhs', false, [], { a: 'x' }, { 'a': [true, { false: 3.0 }] }];
  it('# should add all valid label types', function () {
    let g = new Graph();
    labels.forEach(label => {
      g.createVertex(label, { weight: Math.random() });
    });

    let e = g.createEdge(labels[1], labels[5]);
    e.source.should.eql(labels[1]);
    e.destination.should.eql(labels[5]);
    g.hasEdge(e).should.be.true();

    e = g.createEdge(labels[0], labels[6], { weight: 5, label: 'edge label' });

    e.source.should.eql(labels[0]);
    e.destination.should.eql(labels[6]);
    e.weight.should.eql(5);
    e.label.should.eql('edge label');
    g.hasEdge(e).should.be.true();

    e = new Edge(labels[0], labels[2]);
    g.hasEdge(e).should.be.false();

    g.hasEdgeBetween(labels[0], labels[6]).should.be.true();
    g.hasEdgeBetween(labels[6], labels[0]).should.be.false();
    g.hasEdgeBetween(labels[1], labels[5]).should.be.true();
    g.hasEdgeBetween(labels[5], labels[1]).should.be.false();
    g.hasEdgeBetween(labels[0], labels[2]).should.be.false();
    g.hasEdgeBetween(labels[2], labels[0]).should.be.false();
  });

  it('# should throw when vertices are not in the graph', function () {
    let g = new Graph();
    labels.forEach(label => {
      g.createVertex(label, { weight: Math.random() });
    });
    expect(() => g.createEdge('v', labels[0])).to.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', 'v'));
    expect(() => g.createEdge(labels[0], 'u')).to.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', 'u'));
  });
});

describe('addEdge()', () => {
  const labels = [1, '65.231', 'adbfhs', false, [], { a: 'x' }, { 'a': [true, { false: 3.0 }] }];
  it('# should add all valid label types', function () {
    let g = new Graph();
    labels.forEach(label => {
      g.createVertex(label, { weight: Math.random() });
    });

    let expected = new Edge(labels[0], labels[2]);
    let e = g.addEdge(expected);
    expected.equals(e).should.be.true();

    g.hasEdge(expected).should.be.true();
  });

  it('# should throw when vertices are not in the graph', function () {
    let g = new Graph();
    labels.forEach(label => {
      g.createVertex(label, { weight: Math.random() });
    });
    let e1 = new Edge('a', labels[0]);
    let e2 = new Edge(labels[1], -Math.random());
    expect(() => g.addEdge(e1)).to.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.addEdge', e1.source));
    expect(() => g.addEdge(e2)).to.throw(ERROR_MSG_VERTEX_NOT_FOUND('Graph.addEdge', e2.destination));
  });
});

describe('getEdgeLabel', () => {
  const g = createExampleGraph();

  it('# Should retrieve the right label', function () {
    g.getEdgeLabel('a random unicòde string ☺', 1).should.eql('label');
  });

  it('# Should return undefined when edge does not have a label', function () {
    g.hasEdgeBetween(-3.1415, { 'what': -3 }).should.be.true();
    expect(g.getEdgeLabel(-3.1415, { 'what': -3 })).to.be.undefined;
  });

  it('# Should return undefined when edge does not exist', function () {
    expect(g.getEdgeLabel(1, 'a random unicòde string ☺')).to.be.undefined;
    expect(g.getEdgeLabel('not in graph', 1)).to.be.undefined;
    expect(g.getEdgeLabel(3, 2)).to.be.undefined;
  });
});

describe('getEdgeWeight', () => {
  const g = createExampleGraph();

  it('# Should retrieve the right weight', function () {
    g.getEdgeWeight('a random unicòde string ☺', 1).should.eql(-0.1e14);
    g.getEdgeWeight(-3.1415, { 'what': -3 }).should.eql(33);

  });

  it('# Should default to 1 (when edge weight is not set explicitly)', function () {
    g.hasEdgeBetween(-3.1415, [1, true, -3]).should.be.true();
    g.getEdgeWeight(-3.1415, [1, true, -3]).should.eql(1);
  });

  it('# Should return undefined when edge does not exist', function () {
    expect(g.getEdgeWeight(1, 'a random unicòde string ☺')).to.be.undefined;
    expect(g.getEdgeWeight('not in graph', 1)).to.be.undefined;
    expect(g.getEdgeWeight(3, 2)).to.be.undefined;
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
  const sources = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
  const labels = ['', '1', '-1e14', 'test n° 1', 'unicode ☻'];
  it('# should return a valid json', () => {
    sources.forEach(sourceLabel => {
      const dest = choose(sources);
      const edgeLabel = choose(labels);
      const weight = Math.random();
      let e = new Edge(sourceLabel, dest, { label: edgeLabel, weight: weight });
      let v = new Vertex(sourceLabel, { weight: Math.random(), outgoingEdges: [e] });
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

    g.toJson().should.eql('{"vertices":["{\\"label\\":\\"abc\\",\\"weight\\":1}","{\\"label\\":1,\\"weight\\":1}","{\\"label\\":3.1415,\\"weight\\":1}","{\\"label\\":{\\"what\\":-3},\\"weight\\":1}"],"edges":["{\\"destination\\":1,\\"label\\":\\"label\\",\\"source\\":\\"abc\\",\\"weight\\":-10000000000000}","{\\"destination\\":{\\"what\\":-3},\\"label\\":null,\\"source\\":3.1415,\\"weight\\":33}"]}');
  });
});

describe('clone()', () => {
  it('# should clone the graph correctly', () => {
    let g = createRandomGraph(8, 11, 3, 15);
    g.clone().equals(g).should.be.true();
  });

  it('# modifying deep clones should not affect originals', () => {
    let g = new Graph();
    
    let v1 = { 'what': -3 };
    let v2 = [1, true, -3];

    g.createVertex(v1);
    g.createVertex(v2);
    g.createEdge(v1, v2);
    let g1 = g.clone();

    v1['new'] = true;

    g.hasVertex(v1).should.be.false();
    g1.hasVertex(v1).should.be.false();
    g.hasVertex({ 'what': -3 }).should.be.true();
    g1.hasVertex({ 'what': -3 }).should.be.true();
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