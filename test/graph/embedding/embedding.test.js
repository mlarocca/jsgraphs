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
    it('# complete graphs should return a valid json', () => {
      const emb = Embedding.completeGraph(10, 400);
      console.log(emb.toSvg(400, 400, {'1': ['warning'], '2': ['error'], '3': ['warning', 'source']}));
    });  

    it('# complete bipartite graphs should return a valid json', () => {
      const emb = Embedding.completeBipartiteGraph(6, 4, 400);
      let classes = {};
      range(1, 7).forEach(i => classes[`${i}`] = ['left']);
      range(7, 11).forEach(i => classes[`${i}`] = ['right']);
      console.log(emb.toSvg(400, 400, classes));
    });  
  });
});