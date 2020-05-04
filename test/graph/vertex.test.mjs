import 'mjs-mocha';

import Vertex from '../../src/graph/vertex.mjs';

import { choose } from '../../src/common/array.mjs';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_DATA, ERROR_MSG_INVALID_LABEL, ERROR_MSG_INVALID_NAME } from '../../src/common/errors.mjs'
import { testAPI, testStaticAPI } from '../utils/test_common.mjs';

import chai from "chai";
import should from "should";   // lgtm[js/unused-local-variable]
const expect = chai.expect;

describe('Vertex API', () => {
  it('# Class should have a constructor method', function () {
    Vertex.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = ['fromJson', 'fromJsonObject', 'isValidName', 'isValidLabel', 'isValidData', 'idFromName'];
    testStaticAPI(Vertex, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let vertex = new Vertex(1);
    let methods = ['constructor', 'hasLabel', 'hasData', 'equals', 'toJson', 'toJsonObject', 'toString', 'clone'];
    let attributes = ['name', 'id', 'label', 'data', 'escapedName', 'escapedLabel', 'weight'];
    testAPI(vertex, attributes, methods);
  });
});

describe('Vertex Creation', () => {
  describe('# Parameters', () => {
    describe('# 1st argument (mandatory)', () => {
      it('should throw when name is null or undefined', () => {
        (() => new Vertex(null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'name', null));
        (() => new Vertex(undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'name', undefined));
      });

      it('should not throw when name is a string or a number', () => {
        (() => new Vertex(3)).should.not.throw();
        (() => new Vertex(-0.3123)).should.not.throw();
        (() => new Vertex('2')).should.not.throw();
        (() => new Vertex('abc def')).should.not.throw();
        (() => new Vertex('unicode ☺♥')).should.not.throw();
      });

      it('should throw with other types', () => {
        (() => new Vertex([])).should.throw(ERROR_MSG_INVALID_NAME('Vertex()', []));
        (() => new Vertex({})).should.throw(ERROR_MSG_INVALID_NAME('Vertex()', {}));
        (() => new Vertex(false)).should.throw(ERROR_MSG_INVALID_NAME('Vertex()', false));
        (() => new Vertex(new Map())).should.throw(ERROR_MSG_INVALID_NAME('Vertex()', new Map()));
        (() => new Vertex(new Set())).should.throw(ERROR_MSG_INVALID_NAME('Vertex()', new Set()));
      });
    });

    describe('# weight (optional)', () => {
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

    describe('# data (optional)', () => {
      it('should not throw when data  is null or undefined', () => {
        (() => new Vertex('x', { data: null })).should.not.throw();
        (() => new Vertex('v')).should.not.throw();
      });

      it('should throw when data is not convetible to JSON', () => {
        (() => new Vertex(1, { data: new Map() })).should.throw(ERROR_MSG_INVALID_DATA('Vertex()', new Map()));
        (() => new Vertex('1', { data: new Set() })).should.throw(ERROR_MSG_INVALID_DATA('Vertex()', new Set()));
      });

      it('should NOT throw with serializable types', () => {
        (() => new Vertex(1, { data: 3 })).should.not.throw();
        (() => new Vertex(2, { data: '2' })).should.not.throw();
        (() => new Vertex(3, { data: [] })).should.not.throw();
        (() => new Vertex(4, { data: {} })).should.not.throw();
        (() => new Vertex(5, { data: false })).should.not.throw();
      });
    });
  });
});


describe('Attributes', () => {
  const names = [1, -2, 0.31415, '65.231', 'adbfhs'];
  const data = [1, '65.231', 'adbfhs', false, [], { a: 'x' }];

  describe('name', () => {
    it('# should return the correct value for name', () => {
      names.forEach(name => {
        const v = new Vertex(name);
        v.name.should.eql(name);
      });
    });
  });

  describe('weight', () => {
    const weights = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return the correct weight', () => {
      weights.forEach(s => {
        let v = new Vertex(choose(names), { weight: s });
        v.weight.should.eql(Number.parseFloat(s));
      });
    });
  });

  describe('label', () => {
    it('# should be undefined when not set', () => {
      const v = new Vertex('v', { weight: 2, data: ['data'] });
      v.hasLabel().should.be.false();
      expect(v.label).to.be.undefined;
    });

    it('# should return the correct value for data when defined', () => {
      ['a', 'test label', 'unicode ☺'].forEach(label => {
        const v = new Vertex('v', { label: label });
        v.hasLabel().should.be.true();
        v.label.should.eql(label);
      });
    });

    it('# should be set correctly', () => {
      const v = new Vertex('v');
      v.hasLabel().should.be.false();
      expect(v.label).to.be.undefined;
      v.label = 'test';
      v.label.should.eql('test');
    });
  });

  describe('data', () => {
    it('# should be undefined when not set', () => {
      const v = new Vertex('v', { weight: 2, label: 'lab' });
      v.hasData().should.be.false();
      expect(v.data).to.be.undefined;
    });

    it('# should return the correct value for data when defined', () => {
      data.forEach(data => {
        let v = new Vertex('v', { data: data });
        v.hasData().should.be.true();
        v.data.should.eql(data);
      });
    });

    it('# should be set correctly', () => {
      const v = new Vertex('v');
      v.hasData().should.be.false();
      expect(v.data).to.be.undefined;
      data.forEach(data => {
        v.data = data;
        v.hasData().should.be.true();
        v.data.should.eql(data);
      });
    });
  });
});

describe('Methods', () => {
  const vertexNames = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];

  describe('equals()', () => {
    it('# should return true if two edges are equals in all their fields', () => {
      vertexNames.forEach(name => {
        const weight = Math.random()
        let v1 = new Vertex(name, { weight: weight });
        let v2 = new Vertex(name, { weight: weight });
        v1.equals(v2).should.be.true();
      });
    });

    it('# should return false if the argument is not a Vertex', () => {
      vertexNames.forEach(name => {
        const weight = Math.random();
        let v1 = new Vertex(name, { weight: weight });
        v1.equals(choose(vertexNames)).should.be.eql(false);
      });
    });

    it('# should return false if name is different', () => {
      vertexNames.forEach(name => {
        const name2 = choose(vertexNames);
        const weight = Math.random();
        let v1 = new Vertex(name, { weight: weight });
        let v2 = new Vertex(name2, { weight: weight });
        v1.equals(v2).should.be.eql(Vertex.idFromName(name) === Vertex.idFromName(name2));
      });
    });

    it('# should return false if weight is different', () => {
      vertexNames.forEach(name => {
        const weight1 = Math.random();
        const weight2 = Math.random();
        let v1 = new Vertex(name, { weight: weight1 });
        let v2 = new Vertex(name, { weight: weight2 });
        v1.equals(v2).should.be.eql(weight1 === weight2);
      });
    });
  });

  describe('clone()', () => {
    it('# should clone the vertex fields', () => {
      vertexNames.forEach(name => {
        let v = new Vertex(name);
        v.clone().id.should.eql(v.id);
        v.clone().equals(v).should.be.true();
      });
    });

    it('# changing the cloned instance should not affect the original', () => {
      let v = new Vertex('test', { weight: -3 });
      let w = v.clone();
      v.name.should.eql(w.name);
      v.weight.should.eql(w.weight);
      v.equals(w).should.be.true();
      v.weight = 2;
      v.name.should.eql(w.name);
      v.equals(w).should.be.not.true();
    });
  });

  describe('toJson()', () => {
    it('# should return a valid json', () => {
      vertexNames.forEach(name => {
        let v = new Vertex(name, { weight: Math.random() });
        expect(() => JSON.parse(v.toJson())).not.to.throw();
      });
    });

    it('# should stringify the fields consistently and deep-stringify all the fields', () => {
      let v = new Vertex(0, { weight: 3.14 });
      v.toJson().should.eql('{"name":0,"weight":3.14}');
      v = new Vertex('v', { weight: -3.14, data: ['123', 'a'], label: "test" });
      JSON.parse(v.toJson()).should.eql({ "name": 'v', "weight": -3.14, label: "test", data: ['123', 'a'] });
    });
  });

  describe('fromJson()', () => {
    it('# applyed to the result of toJson, it should match source vertex', () => {
      vertexNames.forEach(source => {
        let v = new Vertex(source, { weight: Math.random() });
        Vertex.fromJsonObject(JSON.parse(v.toJson())).should.eql(v);
      });
    });

    it('# should parse the fields consistently and deep-parse all the fields', () => {
      let v = new Vertex('abc', { weight: 3.14, data: ['123', { 'a': [1, 2, 3], 'b': { 1: 1 } }], label: "test" });
      Vertex.fromJsonObject(JSON.parse(v.toJson())).should.eql(v);
    });
  });

});
