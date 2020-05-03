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
    let staticMethods = ['fromJson', 'fromJsonObject', 'isValidName', 'idFromName'];
    testStaticAPI(Vertex, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let vertex = new Vertex(1);
    let methods = ['constructor', 'equals', 'toJson', 'toJsonObject', 'toString', 'clone'];
    let attributes = ['name', 'escapedName',  'escapedLabel','id', 'weight'];
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

      it('should throw when name is not convetible to JSON', () => {
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
  const names = [1, '65.231', 'adbfhs', false, [], { a: 'x' }];

  describe('name', () => {
    it('# should return the correct value for name', () => {
      names.forEach(name => {
        let v = new Vertex(name, 1);
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
});

describe('Methods', () => {
  const vertexNames = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
  const edgeNames = ['', '1', '-1e14', 'test n° 1', 'unicode ☻'];

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
      let v = new Vertex({ 'test': 1 }, { weight: -3 });
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
      Vertex.isValidName(new Vertex('test')).should.be.true();
      vertexNames.forEach(name => {
        let v = new Vertex(name, { weight: Math.random() });
        expect(() => JSON.parse(v.toJson())).not.to.throw();
      });
    });

    it('# should stringify the fields consistently and deep-stringify all the fields', () => {
      let v = new Vertex({ 'test': ['abc', 1, 3] }, { weight: 3.14 });
      v.toJson().should.eql('{"name":{"test":["abc",1,3]},"weight":3.14}');
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
      let v = new Vertex('abc', { weight: 3.14 });
      Vertex.fromJsonObject(JSON.parse(v.toJson())).should.eql(v);
    });
  });

});
