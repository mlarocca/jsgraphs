import 'mjs-mocha';

import Vertex from '../../src/graph/vertex.mjs';

import { choose } from '../../src/common/array.mjs';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_LABEL } from '../../src/common/errors.mjs'
import { testAPI, testStaticAPI } from '../utils/test_common.mjs';

import chai from "chai";
import should from "should";   // lgtm[js/unused-local-variable]
const expect = chai.expect;

describe('Vertex API', () => {
  it('# Class should have a constructor method', function () {
    Vertex.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = ['fromJson', 'fromJsonObject', 'isValidLabel', 'idFromLabel'];
    testStaticAPI(Vertex, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let vertex = new Vertex(1);
    let methods = ['constructor', 'equals', 'toJson', 'toJsonObject', 'toString', 'clone'];
    let attributes = ['label', 'escapedLabel',  'id', 'weight'];
    testAPI(vertex, attributes, methods);
  });
});

describe('Vertex Creation', () => {
  describe('# Parameters', () => {
    describe('# 1st argument (mandatory)', () => {
      it('should throw when label is null or undefined', () => {
        (() => new Vertex(null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'label', null));
        (() => new Vertex(undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'label', undefined));
      });

      it('should throw when label is not convetible to JSON', () => {
        (() => new Vertex(new Map())).should.throw(ERROR_MSG_INVALID_LABEL('Vertex()', new Map()));
        (() => new Vertex(new Set())).should.throw(ERROR_MSG_INVALID_LABEL('Vertex()', new Set()));
      });

      it('should NOT throw with other types', () => {
        (() => new Vertex(3)).should.not.throw();
        (() => new Vertex('2')).should.not.throw();
        (() => new Vertex([])).should.not.throw();
        (() => new Vertex({})).should.not.throw();
        (() => new Vertex(false)).should.not.throw();
      });
    });

    describe('# 2nd argument (optional)', () => {
      it('should default to weight=1', () => {
        new Vertex(2).weight.should.eql(1);
      });

      it('should throw when weight is not (parsable to) a number', () => {
        (() => new Vertex(1, { weight: null })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'weight', null));
        (() => new Vertex('1', { weight: 'a' })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'weight', 'a'));
        (() => new Vertex([1, 2, 3], { weight: new Map() })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'weight', new Map()));
      });

      it('should NOT throw with numbers and numeric strings', () => {
        (() => new Vertex(1, { weight: 0 })).should.not.throw();
        (() => new Vertex(1, { weight: 1 })).should.not.throw();
        (() => new Vertex(1, { weight: -1 })).should.not.throw();
        (() => new Vertex(1, { weight: 3.14 })).should.not.throw();
        (() => new Vertex(1, { weight: -1.5e7 })).should.not.throw();
        (() => new Vertex(1, { weight: '0' })).should.not.throw();
        (() => new Vertex(1, { weight: '1' })).should.not.throw();
        (() => new Vertex(1, { weight: '-1' })).should.not.throw();
        (() => new Vertex(1, { weight: '3.14' })).should.not.throw();
        (() => new Vertex(1, { weight: '-1.5e7' })).should.not.throw();
      });
    });
  });
});


describe('Attributes', () => {
  const labels = [1, '65.231', 'adbfhs', false, [], { a: 'x' }];

  describe('label', () => {
    it('# should return the correct value for label', () => {
      labels.forEach(label => {
        let v = new Vertex(label, 1);
        v.label.should.eql(label);
      });
    });
  });

  describe('weight', () => {
    const weights = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return the correct weight', () => {
      weights.forEach(s => {
        let v = new Vertex(choose(labels), { weight: s });
        v.weight.should.eql(Number.parseFloat(s));
      });
    });
  });
});

describe('Methods', () => {
  const vertexLabels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
  const edgeLabels = ['', '1', '-1e14', 'test n° 1', 'unicode ☻'];

  describe('equals()', () => {
    it('# should return true if two edges are equals in all their fields', () => {
      vertexLabels.forEach(label => {
        const weight = Math.random()
        let v1 = new Vertex(label, { weight: weight });
        let v2 = new Vertex(label, { weight: weight });
        v1.equals(v2).should.be.true();
      });
    });

    it('# should return false if the argument is not a Vertex', () => {
      vertexLabels.forEach(label => {
        const weight = Math.random();
        let v1 = new Vertex(label, { weight: weight });
        v1.equals(choose(vertexLabels)).should.be.eql(false);
      });
    });

    it('# should return false if label is different', () => {
      vertexLabels.forEach(label => {
        const label2 = choose(vertexLabels);
        const weight = Math.random();
        let v1 = new Vertex(label, { weight: weight });
        let v2 = new Vertex(label2, { weight: weight });
        v1.equals(v2).should.be.eql(Vertex.idFromLabel(label) === Vertex.idFromLabel(label2));
      });
    });

    it('# should return false if weight is different', () => {
      vertexLabels.forEach(label => {
        const weight1 = Math.random();
        const weight2 = Math.random();
        let v1 = new Vertex(label, { weight: weight1 });
        let v2 = new Vertex(label, { weight: weight2 });
        v1.equals(v2).should.be.eql(weight1 === weight2);
      });
    });
  });

  describe('clone()', () => {
    it('# should clone the vertex fields', () => {
      vertexLabels.forEach(label => {
        let v = new Vertex(label);
        v.clone().id.should.eql(v.id);
        v.clone().equals(v).should.be.true();
      });
    });

    it('# changing the cloned instance should not affect the original', () => {
      let v = new Vertex({ 'test': 1 }, { weight: -3 });
      let w = v.clone();
      v.label.should.eql(w.label);
      v.weight.should.eql(w.weight);
      v.equals(w).should.be.true();
      v.weight = 2;
      v.label.should.eql(w.label);
      v.equals(w).should.be.not.true();
    });
  });

  describe('toJson()', () => {
    it('# should return a valid json', () => {
      Vertex.isValidLabel(new Vertex('test')).should.be.true();
      vertexLabels.forEach(label => {
        let v = new Vertex(label, { weight: Math.random() });
        expect(() => JSON.parse(v.toJson())).not.to.throw();
      });
    });

    it('# should stringify the fields consistently and deep-stringify all the fields', () => {
      let v = new Vertex({ 'test': ['abc', 1, 3] }, { weight: 3.14 });
      v.toJson().should.eql('{"label":{"test":["abc",1,3]},"weight":3.14}');
    });
  });

  describe('fromJson()', () => {
    it('# applyed to the result of toJson, it should match source vertex', () => {
      vertexLabels.forEach(source => {
        let v = new Vertex(source, { weight: Math.random() });
        Vertex.fromJsonObject(JSON.parse(v.toJson())).should.eql(v);
      });
    });

    it('# should parse the fields consistently and deep-parse all the fields', () => {
      let v = new Vertex('abc', { weight: 3.14 });
      Vertex.fromJsonObject(JSON.parse(v.toJson())).should.eql(v);
    });
  });

});
