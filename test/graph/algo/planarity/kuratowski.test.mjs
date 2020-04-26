import { isPlanar } from '../../../../src/graph/algo/planarity/kuratowski.mjs';

import Graph from '../../../../src/graph/graph.mjs';
import Vertex from '../../../../src/graph/vertex.mjs';
import { UndirectedGraph } from '../../../../src/graph/graph.mjs';

import { randomInt, range } from '../../../../src/common/numbers.mjs';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../../../src/common/errors.mjs'

import 'mjs-mocha';
import chai from "chai";
import should from "should";   // lgtm[js/unused-local-variable]
const expect = chai.expect;    // lgtm[js/unused-local-variable]

describe('Kuratowski\' planarity test', () => {
  it('# should throw when the argument is not passed or not a Graph', () => {
    (() => isPlanar()).should.throw(ERROR_MSG_INVALID_ARGUMENT('isPlanar', 'graph', undefined));
    (() => isPlanar(null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('isPlanar', 'graph', null));
    (() => isPlanar(new Map())).should.throw(ERROR_MSG_INVALID_ARGUMENT('isPlanar', 'graph', new Map()));
  });

  it('# should throw when the graph is empty', () => {
    const g = new Graph();
    (() => isPlanar(g)).should.throw(ERROR_MSG_INVALID_ARGUMENT('isPlanar', 'graph', g));
  });

  it('# should return true for complete graphs with less than 4 vertices', () => {
    range(2, 5).forEach(n => {
      const g = Graph.completeGraph(n);
      isPlanar(g).should.be.true();
    });
  });

  it('# should return false for complete graphs with 5 or more vertices', () => {
    range(5, 20).forEach(n => {
      const g = Graph.completeGraph(n);
      isPlanar(g).should.be.false();
    });
  });

  it('# should return true for complete bipartite graphs when a partition has less than 3 vertices', () => {
    range(1, 3).forEach(n => {
      range(1, 7).forEach(m => {
        const g = Graph.completeBipartiteGraph(n, m);
        isPlanar(g).should.be.true();
      });
    });
  });

  it('# should return false for complete bipartite graphs when both partitions have 3 or more vertices', () => {
    range(3, 15).forEach(n => {
      range(3, 15).forEach(m => {
        const g = Graph.completeBipartiteGraph(n, m);
        isPlanar(g).should.be.false();
      });
    });
  });

  it('# should return true for a planar graph', () => {
    let g = new Graph();
    const numVertices = 7;
    // Just not enough vertices for the graph surely to be non-planar
    const numEdges = randomInt(7, 10);

    for (let i = 0; i < numVertices; i++) {
      g.createVertex(i);
    }

    for (let j = 0; j < numEdges; j++) {
      let v = randomInt(0, numVertices);
      let u = randomInt(0, numVertices);
      g.createEdge(Vertex.idFromLabel(u), Vertex.idFromLabel(v), { weight: Math.random() });
    }

    isPlanar(g).should.be.true();
  });

  it('# should return false for a non-planar graph including K5', () => {
    let g = UndirectedGraph.completeGraph(5);
    isPlanar(g).should.be.false();
    g.createVertex('a');
    isPlanar(g).should.be.false();
    g.createEdge('"a"', '1');
    g.createEdge('"a"', '3');
    isPlanar(g).should.be.false();

    g.createVertex('b');
    g.createEdge('"a"', '"b"');
    isPlanar(g).should.be.false();
  });

  it('# should return false for a non-planar graph including K3_3',   () => {
    let g = UndirectedGraph.completeBipartiteGraph(3,3);
    isPlanar(g).should.be.false();
    // Try to make it not bipartite
    g.createEdge('1', '2');
    isPlanar(g).should.be.false();

    g.createVertex('a');
    isPlanar(g).should.be.false();
    g.createEdge('"a"', '1');
    g.createEdge('"a"', '2');
    isPlanar(g).should.be.false();

    g.createVertex('b');
    g.createEdge('"a"', '"b"');
    isPlanar(g).should.be.false();
  });
});