import 'mjs-mocha';

import Embedding from '../../../src/graph/embedding/embedding.js';

import Graph from '../../../src/graph/graph.js';

import { choose } from '../../../src/common/array.js';
import { consistentStringify } from '../../../src/common/strings.js';
import { testAPI, testStaticAPI } from '../../utils/test_common.js';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_LABEL } from '../../../src/common/errors.js';

import chai from "chai";
import should from "should";
import { range } from '../../../src/common/numbers.js';
import Point2D from '../../../src/geometric/point2d.js';

const expect = chai.expect;

describe('Embedding API', () => {

  it('# Class should have a constructor method', function () {
    Embedding.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = ['fromJson'];
    testStaticAPI(Embedding, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let embedding = new Embedding(new Graph(), new Map());
    let methods = ['constructor', 'getVertex', 'getEdge', 'toJson', 'toSvg'];
    let attributes = ['vertices', 'edges'];
    testAPI(embedding, attributes, methods);
  });
});

describe('Embedding Creation', () => {
  describe('# Parameters', () => {
    describe('# 1st argument (mandatory)', () => {
      // it('should throw when source is null or undefined', () => {
      //   (() => new Embedding(null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'source', null));
      //   (() => new Embedding(undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'source', undefined));
      // });

      // it('should throw when label is not convetible to JSON', () => {
      //   (() => new Embedding(new Map(), 1)).should.throw(ERROR_MSG_INVALID_LABEL('Embedding()', 'source', new Map()));
      //   (() => new Embedding(new Set(), 2)).should.throw(ERROR_MSG_INVALID_LABEL('Embedding()', 'source', new Set()));
      // });

      // it('should NOT throw with other types', () => {
      //   (() => new Embedding(3, 1)).should.not.throw();
      //   (() => new Embedding('2', 1)).should.not.throw();
      //   (() => new Embedding([], 1)).should.not.throw();
      //   (() => new Embedding({}, 1)).should.not.throw();
      //   (() => new Embedding(false, 1)).should.not.throw();
      // });
    });

    describe('# 2nd argument (mandatory)', () => {
      // it('should throw when destination is null or undefined', () => {
      //   (() => new Embedding(1, null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'destination', null));
      //   (() => new Embedding('1', undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'destination', undefined));
      // });

      // it('should throw when label is not convetible to JSON', () => {
      //   (() => new Embedding(1, new Map())).should.throw(ERROR_MSG_INVALID_LABEL('Embedding()', 'destination', new Map()));
      //   (() => new Embedding(3, new Set())).should.throw(ERROR_MSG_INVALID_LABEL('Embedding()', 'destination', new Set()));
      // });

      // it('should NOT throw with other types', () => {
      //   (() => new Embedding(3, '2')).should.not.throw();
      //   (() => new Embedding('2', 3)).should.not.throw();
      //   (() => new Embedding([], true)).should.not.throw();
      //   (() => new Embedding({}, [])).should.not.throw();
      //   (() => new Embedding(false, {})).should.not.throw();
      // });
    });
  });
});

describe('Attributes', () => {

});

describe('Methods', () => {
  describe('toJson()', () => {
    it('# should return a valid json', () => {
      // labels.forEach(label => {
      //   let source = choose(sources);
      //   let dest = choose(sources);
      //   let weight = Math.random();
      //   let e = new Embedding(source, dest, { label: label, weight: weight });
      //   expect(() => JSON.parse(e.toJson())).not.to.throw();
      // });
    });

    it('# should stringify the fields consistently', () => {
      // let e = new Embedding(0, '1', { label: 'label', weight: -0.1e14 });
      // e.toJson().should.eql('{"destination":"1","label":"label","source":0,"weight":-10000000000000}');
    });

    it('# should deep-stringify all the fields', () => {
      // let source = { a: 1, b: [{ c: 'cLab' }, 4] };
      // let dest = [1, 2, 3, [4, 5, 6]];
      // let label = "undefined label"
      // let weight = 1.1e4;
      // let e = new Embedding(source, dest, { label: label, weight: weight });
      // e.toJson().should.eql('{"destination":["1","2","3","[\\\"4\\\",\\\"5\\\",\\\"6\\\"]"],"label":"undefined label","source":{"a":1,"b":["{\\\"c\\\":\\\"cLab\\\"}","4"]},"weight":11000}');
    });
  });
  describe('toSVG()', () => {
    it('# complete graphs should return a valid svg', () => {
      const emb = Embedding.completeGraph(10, 400);
      console.log(emb.toSvg(400, 400, {
        graphCss: ['complete'],
        verticesCss: { '1': ['warning'], '2': ['error'], '3': ['warning', 'source'] },
        useArcs: true
      }));
    });

    it('# complete bipartite graphs should return a valid svg', () => {
      const emb = Embedding.completeBipartiteGraph(6, 4, 400);
      let vClasses = {};
      range(1, 7).forEach(i => vClasses[`${i}`] = ['left']);
      range(7, 11).forEach(i => vClasses[`${i}`] = ['right']);
      console.log(emb.toSvg(400, 400, {
        graphCss: ['complete bipartite'],
        verticesCss: vClasses
      }));
    });

    it('# DAG should return a valid svg', () => {
      let graph = new Graph();
      graph.createVertex('Start', { weight: 2 });
      graph.createVertex('A');
      graph.createVertex('B', { weight: 1.5 });
      graph.createVertex('C', { weight: 1.5 });
      graph.createVertex('D', { weight: 1.5 });
      graph.createVertex('E', { weight: 1.5 });
      graph.createVertex('F', { weight: 2 });
      graph.createVertex('G', { weight: 2 });
      graph.createVertex('Finish', { weight: 2.5 });
      graph.createEdge('Start', 'A', { label: 'design', weight: 2 });
      graph.createEdge('A', 'B', { label: 'build body' });
      graph.createEdge('A', 'C', { label: 'build wheels' });
      graph.createEdge('A', 'D', { label: 'build frame' });
      graph.createEdge('A', 'E', { label: 'build engine' });
      graph.createEdge('B', 'F', { label: 'paint body' });
      graph.createEdge('D', 'G', { label: 'paint frame' });
      graph.createEdge('C', 'Finish', { label: 'mount wheels' });
      graph.createEdge('E', 'G', { label: 'mount engine on frame' });
      graph.createEdge('F', 'Finish', { label: 'mount body on frame' });
      graph.createEdge('G', 'Finish');

      let emb = new Embedding(graph);

      emb.setVertexPosition('Start', new Point2D(50, 200));
      emb.setVertexPosition('A', new Point2D(200, 200));
      emb.setVertexPosition('B', new Point2D(350, 50));
      emb.setVertexPosition('C', new Point2D(350, 150));
      emb.setVertexPosition('D', new Point2D(350, 250));
      emb.setVertexPosition('E', new Point2D(350, 350));
      emb.setVertexPosition('F', new Point2D(500, 100));
      emb.setVertexPosition('G', new Point2D(600, 300));
      emb.setVertexPosition('Finish', new Point2D(650, 200));

      let vClasses = {
        '"Start"': ['start'],
        '"Finish"': ['finish', 'body', 'wheels', 'frame', 'engine'],
        '"A"': ['init'],
        '"B"': ['build', 'body'],
        '"C"': ['build', 'wheels'],
        '"D"': ['build', 'frame'],
        '"E"': ['build', 'engine'],
        '"F"': ['paint', 'body'],
        '"F"': ['paint', 'frame'],
        '"G"': ['mount', 'body', 'frame', 'engine']
      };

      console.log(emb.toSvg(700, 400, { verticesCss: vClasses }));
    });

    it('# Regex FSA should return a valid svg', () => {
      let graph = new Graph();
      const start = graph.createVertex('Start', { weight: 2 });
      const end = graph.createVertex('End', { weight: 2 });
      const s0 = graph.createVertex('S0', { weight: 1.5 });
      const s1 = graph.createVertex('S1', { weight: 1.5 });
      const s2 = graph.createVertex('S2', { weight: 1.5 });
      const s3 = graph.createVertex('S3', { weight: 1.5 });
      const s4 = graph.createVertex('S4', { weight: 1.5 });
      const s5 = graph.createVertex('S5', { weight: 1.5 });

      graph.createEdge(start, s0, { weight: 3 });
      graph.createEdge(s0, s1, { label: "[a-z0-9]" });
      graph.createEdge(s1, s1, { label: "[a-z0-9_\\-]" });
      graph.createEdge(s1, s2, { label: "@" });
      graph.createEdge(s2, s3, { label: "[a-z0-9]" });
      graph.createEdge(s3, s3, { label: "[a-z0-9_\\-]" });
      graph.createEdge(s3, s4, { label: '"."' });
      graph.createEdge(s4, s5, { label: "[a-z0-9]" });
      graph.createEdge(s5, s5, { label: "[a-z0-9_\\-]" });
      graph.createEdge(s5, s4, { label: '"."' });
      graph.createEdge(s5, end, { label: '""' });

      let emb = new Embedding(graph, new Map(), { width: 700, height: 400 });

      emb.setVertexPosition(start, new Point2D(50, 150));
      emb.setVertexPosition(s0, new Point2D(100, 300));
      emb.setVertexPosition(s1, new Point2D(175, 100));
      emb.setVertexPosition(s2, new Point2D(275, 300));
      emb.setVertexPosition(s3, new Point2D(350, 150));
      emb.setVertexPosition(s4, new Point2D(425, 300));
      emb.setVertexPosition(s5, new Point2D(550, 100));
      emb.setVertexPosition(end, new Point2D(650, 250));

      let classes = {
        [start.id]: ['start'],
        [end.id]: ['end'],
      };
      console.log(emb.toSvg(700, 400, {
        graphCss: ['FSA'],
        verticesCss: classes,
        useArcs: true
      }));

    });

  });
});