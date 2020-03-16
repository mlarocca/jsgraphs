import 'mjs-mocha';

import Vertex from '../../src/graph/vertex.js';
import Edge from '../../src/graph/edge.js';
import { choose } from '../../src/common/array.js';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_ILLEGAL_LABEL } from '../../src/common/errors.js'
import { consistentStringify } from '../../src/common/strings.js';
import { testAPI, testStaticAPI } from '../utils/test_common.js';

import chai from "chai";
import should from "should";
const expect = chai.expect;

describe('Vertex API', () => {

  it('# Class should have a constructor method', function () {
    Vertex.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = ['fromJson', 'fromJsonObject', 'isSerializable', 'serializeLabel'];
    testStaticAPI(Vertex, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let vertex = new Vertex(1);
    let methods = ['constructor', 'equals', 'labelEquals', 'toJson', 'toString', 'clone'];
    let attributes = ['label', 'consistentLabel', 'weight'];
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
        (() => new Vertex(new Map())).should.throw(ERROR_MSG_ILLEGAL_LABEL('Vertex()', 'label', new Map()));
        (() => new Vertex(new Set())).should.throw(ERROR_MSG_ILLEGAL_LABEL('Vertex()', 'label', new Set()));
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
  describe('equals()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return true if two edges are equals in all their fields', () => {
      labels.forEach(label => {
        const weight = Math.random()
        let v1 = new Vertex(label, { weight: weight });
        let v2 = new Vertex(label, { weight: weight });
        v1.equals(v2).should.be.true();
      });
    });

    it('# should return false if the argument is not a Vertex', () => {
      labels.forEach(label => {
        const dest = choose(labels);
        const weight = Math.random();
        let v1 = new Vertex(label, { weight: weight });
        v1.equals(choose(labels)).should.be.eql(false);
      });
    });

    it('# should return false if label is different', () => {
      labels.forEach(label => {
        const label2 = choose(labels);
        const dest = choose(labels);
        const weight = Math.random();
        let v1 = new Vertex(label, { weight: weight });
        let v2 = new Vertex(label2, { weight: weight });
        v1.equals(v2).should.be.eql(consistentStringify(label) === consistentStringify(label2));
      });
    });

    it('# should return false if weight is different', () => {
      labels.forEach(label => {
        const weight1 = Math.random();
        const weight2 = Math.random();
        let v1 = new Vertex(label, { weight: weight1 });
        let v2 = new Vertex(label, { weight: weight2 });
        v1.equals(v2).should.be.eql(consistentStringify(weight1) === consistentStringify(weight2));
      });
    });

    it('# should return true even if edges are different', () => {
      labels.forEach(label => {
        const dest = choose(labels);
        const edgeLabel1 = choose(labels);
        const edgeLabel2 = choose(labels);

        let e1 = new Edge(label, dest, { label: edgeLabel1, weight: Math.random() });
        let e2 = new Edge(label, dest, { label: edgeLabel2, weight: Math.random() });
        const weight = Math.random();
        let v1 = new Vertex(label, { weight: weight, outgoingEdges: [e1, e2] });
        let v2 = new Vertex(label, { weight: weight, outgoingEdges: [] });
        v1.equals(v2).should.be.eql(true);
        v1 = new Vertex(label, { weight: weight, outgoingEdges: [e1] });
        v2 = new Vertex(label, { weight: weight, outgoingEdges: [e2] });
        v1.equals(v2).should.be.eql(true);
      });
    });
  });

  describe('labelEquals()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return true if the edge\'s label is (deeply)equal to the argument', () => {
      labels.forEach(label => {
        let v = new Vertex(label);
        v.labelEquals(label).should.be.true();
      });
    });

    it('# should return false iff label is different', () => {
      labels.forEach(label => {
        let v = new Vertex(label);
        v.labelEquals(label).should.be.true();
        const label2 = choose(labels);
        v.labelEquals(label2).should.be.eql(consistentStringify(label) === consistentStringify(label2));
      });
    });
  });

  describe('clone()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should clone the vertex fields', () => {
      labels.forEach(label => {
        let v = new Vertex(label);
        v.clone().labelEquals(label).should.be.true();
        v.clone().equals(v).should.be.true();
      });
    });

    it('# changing the cloned instance should not affect the original', () => {
      let v = new Vertex({ 'test': 1 }, { weight: -3 });
      let w = v.clone();
      v.label.should.eql(w.label);
      v.weight.should.eql(w.weight);
      v.equals(w).should.be.true();
      v.label['test'] = 2;
      v.label['new'] = 3;

      v.label.should.not.eql(w.label);
      v.equals(w).should.not.be.true();
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
        let v = new Vertex(label, { weight: Math.random(), outgoingEdges: [e] });
        expect(() => JSON.parse(v.toJson())).not.to.throw();
      });
    });

    it('# should stringify the fields consistently and deep-stringify all the fields', () => {
      let e = new Edge('abc', '1', { label: 'label', weight: -0.1e14 });
      let v = new Vertex('abc', { weight: 3.14, outgoingEdges: [e] });
      v.toJson().should.eql('{"label":"abc","weight":3.14}');
    });
  });

  describe('fromJson()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# applyed to the result of toJson, it should match source vertex ', () => {
      labels.forEach(label => {
        let e1 = new Edge(label, choose(labels), { label: choose(labels), weight: Math.random() });
        let e2 = new Edge(label, choose(labels), { label: choose(labels), weight: Math.random() });
        let e3 = new Edge(label, choose(labels), { label: choose(labels), weight: Math.random() });
        let v = new Vertex(label, { weight: Math.random(), outgoingEdges: [e1, e2, e3] });
        Vertex.fromJsonObject(JSON.parse(v.toJson())).should.eql(v);
      });
    });

    it('# should parse the fields consistently and deep-parse all the fields', () => {
      let e = new Edge('abc', '1', { label: 'label', weight: -0.1e14 });
      let v = new Vertex('abc', { weight: 3.14, outgoingEdges: [e] });
      Vertex.fromJsonObject(JSON.parse(v.toJson())).should.eql(v);
    });
  });

});
