import 'mjs-mocha';

import EmbeddedVertex from '../../../src/graph/embedding/embedded_vertex.js';

import Graph from '../../../src/graph/graph.js';

import { choose } from '../../../src/common/array.js';
import { consistentStringify } from '../../../src/common/strings.js';
import { testAPI, testStaticAPI } from '../../utils/test_common.js';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_LABEL } from '../../../src/common/errors.js';

import chai from "chai";
import should from "should";
import Point from '../../../src/geometric/point.js';

const expect = chai.expect;

describe('EmbeddedVertex API', () => {

  it('# Class should have a constructor method', function () {
    EmbeddedVertex.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = [];
    testStaticAPI(EmbeddedVertex, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let embeddedVertex = new EmbeddedVertex("test", new Point(1, 2));
    let methods = ['constructor', 'toJson', 'toString', 'toSvg', 'clone'];
    let attributes = ['position', 'radius'];
    testAPI(embeddedVertex, attributes, methods);
  });
});

describe('EmbeddedVertex Creation', () => {
  describe('# Parameters', () => {
    let point = new Point(1,2,3);
    describe('# 1st argument (mandatory)', () => {
      it('should throw when label is null or undefined', () => {
        (() => new EmbeddedVertex(null, point)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'label', null));
        (() => new EmbeddedVertex(undefined, point)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'label', undefined));
      });

      it('should throw when label is not convetible to JSON', () => {
        (() => new EmbeddedVertex(new Map(), point)).should.throw(ERROR_MSG_INVALID_LABEL('Vertex()', 'label', new Map()));
        (() => new EmbeddedVertex(new Set(), point)).should.throw(ERROR_MSG_INVALID_LABEL('Vertex()', 'label', new Set()));
      });

      it('should NOT throw with other types', () => {
        (() => new EmbeddedVertex(3, point)).should.not.throw();
        (() => new EmbeddedVertex('2', point)).should.not.throw();
        (() => new EmbeddedVertex([], point)).should.not.throw();
        (() => new EmbeddedVertex({}, point)).should.not.throw();
        (() => new EmbeddedVertex(false, point)).should.not.throw();
      });
    });

    describe('# 2nd argument (mandatory)', () => {
      // it('should throw when destination is null or undefined', () => {
      //   (() => new EmbeddedVertex(1, null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex()', 'destination', null));
      //   (() => new EmbeddedVertex('1', undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex()', 'destination', undefined));
      // });

      // it('should throw when label is not convetible to JSON', () => {
      //   (() => new EmbeddedVertex(1, new Map())).should.throw(ERROR_MSG_INVALID_LABEL('EmbeddedVertex()', 'destination', new Map()));
      //   (() => new EmbeddedVertex(3, new Set())).should.throw(ERROR_MSG_INVALID_LABEL('EmbeddedVertex()', 'destination', new Set()));
      // });

      // it('should NOT throw with other types', () => {
      //   (() => new EmbeddedVertex(3, '2')).should.not.throw();
      //   (() => new EmbeddedVertex('2', 3)).should.not.throw();
      //   (() => new EmbeddedVertex([], true)).should.not.throw();
      //   (() => new EmbeddedVertex({}, [])).should.not.throw();
      //   (() => new EmbeddedVertex(false, {})).should.not.throw();
      // });
    });

    describe('# 3rd argument (optional)', () => {
      it('should default to weight=1', () => {
        new EmbeddedVertex(2, point).weight.should.eql(1);
      });

      it('should throw when weight is not (parsable to) a number', () => {
        (() => new EmbeddedVertex(1, point, { weight: null })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'weight', null));
        (() => new EmbeddedVertex('1', point, { weight: 'a' })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'weight', 'a'));
        (() => new EmbeddedVertex([1, 2, 3], point, { weight: new Map() })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'weight', new Map()));
      });

      it('should NOT throw with numbers and numeric strings', () => {
        (() => new EmbeddedVertex(1, point, { weight: 0 })).should.not.throw();
        (() => new EmbeddedVertex(1, point, { weight: 1 })).should.not.throw();
        (() => new EmbeddedVertex(1, point, { weight: -1 })).should.not.throw();
        (() => new EmbeddedVertex(1, point, { weight: 3.14 })).should.not.throw();
        (() => new EmbeddedVertex(1, point, { weight: -1.5e7 })).should.not.throw();
        (() => new EmbeddedVertex(1, point, { weight: '0' })).should.not.throw();
        (() => new EmbeddedVertex(1, point, { weight: '1' })).should.not.throw();
        (() => new EmbeddedVertex(1, point, { weight: '-1' })).should.not.throw();
        (() => new EmbeddedVertex(1, point, { weight: '3.14' })).should.not.throw();
        (() => new EmbeddedVertex(1, point, { weight: '-1.5e7' })).should.not.throw();
      });
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
      //   let e = new EmbeddedVertex(source, dest, { label: label, weight: weight });
      //   expect(() => JSON.parse(e.toJson())).not.to.throw();
      // });
    });

    it('# should stringify the fields consistently', () => {
      // let e = new EmbeddedVertex(0, '1', { label: 'label', weight: -0.1e14 });
      // e.toJson().should.eql('{"destination":"1","label":"label","source":0,"weight":-10000000000000}');
    });

    it('# should deep-stringify all the fields', () => {
      // let source = { a: 1, b: [{ c: 'cLab' }, 4] };
      // let dest = [1, 2, 3, [4, 5, 6]];
      // let label = "undefined label"
      // let weight = 1.1e4;
      // let e = new EmbeddedVertex(source, dest, { label: label, weight: weight });
      // e.toJson().should.eql('{"destination":["1","2","3","[\\\"4\\\",\\\"5\\\",\\\"6\\\"]"],"label":"undefined label","source":{"a":1,"b":["{\\\"c\\\":\\\"cLab\\\"}","4"]},"weight":11000}');
    });
  });

  describe('toSvg()', () => {
    it('# should return a valid svg', () => {
      let vertex = new EmbeddedVertex("test", new Point(10, 10), {weight: 10});
      console.log(vertex.toSvg());
    });
  });
});