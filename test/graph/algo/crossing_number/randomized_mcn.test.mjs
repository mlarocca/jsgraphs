import { minimumIntersectionsEmbedding } from '../../../../src/graph/algo/crossing_number/randomized_mcn.mjs';

import Graph from '../../../../src/graph/graph.mjs';
import Vertex from '../../../../src/graph/vertex.mjs';
import { UndirectedGraph } from '../../../../src/graph/graph.mjs';

import { randomInt, range } from '../../../../src/common/numbers.mjs';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../../../src/common/errors.mjs'

import 'mjs-mocha';
import chai from "chai";       // lgtm[js/unused-local-variable]
import should from "should";   // lgtm[js/unused-local-variable]

describe('Randomized Algorithm For Minimum Intersections Embedding', () => {
  it('# should throw when the first argument is not passed or not a Graph', () => {
    (() => minimumIntersectionsEmbedding()).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'graph', undefined));
    (() => minimumIntersectionsEmbedding(null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'graph', null));
    (() => minimumIntersectionsEmbedding(new Map())).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'graph', new Map()));
  });

  it('# should throw when the graph is empty', () => {
    const g = new Graph();
    (() => minimumIntersectionsEmbedding(g)).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'graph', g));
  });

  it('# should throw when the number of runs is not of the right type', () => {
    const g = Graph.completeGraph(2);
    (() => minimumIntersectionsEmbedding(g)).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'runs', undefined));
    (() => minimumIntersectionsEmbedding(g, null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'runs', null));
    (() => minimumIntersectionsEmbedding(g, 'a')).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'runs', 'a'));
    (() => minimumIntersectionsEmbedding(g, new Map())).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'runs', new Map()));
    (() => minimumIntersectionsEmbedding(g, 1.1)).should.throw('Illegal argument for range: b = 1.1 must be a SafeInteger');
  });


  it('# should throw when the width is not of the right type', () => {
    const g = Graph.completeGraph(2);
    (() => minimumIntersectionsEmbedding(g, 1, {width: 'a'})).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'width', 'a'));
  });

  it('# should throw when the height is not of the right type', () => {
    const g = Graph.completeGraph(2);
    (() => minimumIntersectionsEmbedding(g, 1, {height: 'a'})).should.throw(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'height', 'a'));
  });

  it('# should not throw when all arguments are fine', () => {
    const g = Graph.completeGraph(2);
    (() => minimumIntersectionsEmbedding(g, 1)).should.not.throw();
    (() => minimumIntersectionsEmbedding(g, 10, {width: '100', height: 50})).should.not.throw();
  });
});