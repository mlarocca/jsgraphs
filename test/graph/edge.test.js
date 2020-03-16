import 'mjs-mocha';

import Edge from '../../src/graph/edge.js';
import { choose } from '../../src/common/array.js';
import { consistentStringify } from '../../src/common/strings.js';
import { testAPI, testStaticAPI } from '../utils/test_common.js';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_ILLEGAL_LABEL } from '../../src/common/errors.js';

import chai from "chai";
import should from "should";

const expect = chai.expect;

describe('Edge API', () => {

  it('# Class should have a constructor method', function () {
    Edge.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = ['fromJson', 'fromJsonObject'];
    testStaticAPI(Edge, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let edge = new Edge(1, 2);
    let methods = ['constructor', 'hasNegativeWeight', 'isLoop', 'hasLabel', 'toJson', 'toString', 'equals', 'labelEquals', 'clone'];
    let attributes = ['source', 'destination', 'weight', 'label'];
    testAPI(edge, attributes, methods);
  });
});

describe('Edge Creation', () => {
  describe('# Parameters', () => {
    describe('# 1st argument (mandatory)', () => {
      it('should throw when source is null or undefined', () => {
        (() => new Edge(null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'source', null));
        (() => new Edge(undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'source', undefined));
      });

      it('should throw when label is not convetible to JSON', () => {
        (() => new Edge(new Map(), 1)).should.throw(ERROR_MSG_ILLEGAL_LABEL('Edge()', 'source', new Map()));
        (() => new Edge(new Set(), 2)).should.throw(ERROR_MSG_ILLEGAL_LABEL('Edge()', 'source', new Set()));
      });

      it('should NOT throw with other types', () => {
        (() => new Edge(3, 1)).should.not.throw();
        (() => new Edge('2', 1)).should.not.throw();
        (() => new Edge([], 1)).should.not.throw();
        (() => new Edge({}, 1)).should.not.throw();
        (() => new Edge(false, 1)).should.not.throw();
      });
    });

    describe('# 2nd argument (mandatory)', () => {
      it('should throw when destination is null or undefined', () => {
        (() => new Edge(1, null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', null));
        (() => new Edge('1', undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', undefined));
      });

      it('should throw when label is not convetible to JSON', () => {
        (() => new Edge(1, new Map())).should.throw(ERROR_MSG_ILLEGAL_LABEL('Edge()', 'destination', new Map()));
        (() => new Edge(3, new Set())).should.throw(ERROR_MSG_ILLEGAL_LABEL('Edge()', 'destination', new Set()));
      });

      it('should NOT throw with other types', () => {
        (() => new Edge(3, '2')).should.not.throw();
        (() => new Edge('2', 3)).should.not.throw();
        (() => new Edge([], true)).should.not.throw();
        (() => new Edge({}, [])).should.not.throw();
        (() => new Edge(false, {})).should.not.throw();
      });
    });

    describe('# 3rd argument (optional)', () => {
      it('should default to weight=1', () => {
        new Edge(2, 1).weight.should.eql(1);
      });

      it('should throw if it\'s not a number', () => {
        (() => new Edge(3, [], { weight: 'r' })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', 'r'));
        (() => new Edge(3, [], { weight: [] })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', []));
        (() => new Edge(3, [], { weight: false })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', false));
        (() => new Edge(3, [], { weight: {} })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', {}));
      });

      it('should NOT throw with numbers', () => {
        (() => new Edge(2, [], { weight: 1 })).should.not.throw();
        (() => new Edge(2, [], { weight: 0.1 })).should.not.throw();
        (() => new Edge(2, [], { weight: -145 })).should.not.throw();
      });

      it('should NOT throw with numeric strings', () => {
        (() => new Edge(2, [], { weight: '1' })).should.not.throw();
        (() => new Edge(2, [], { weight: '3.1415' })).should.not.throw();
        (() => new Edge(2, [], { weight: '-145' })).should.not.throw();
        (() => new Edge(2, [], { weight: '1e12' })).should.not.throw();
      });
    });

    describe('# 4th argument (optional)', () => {
      it('should default to label=undefined', () => {
        expect(new Edge(2, 1).label).to.be.undefined;
        expect(new Edge(2, 1, { weight: -1 }).label).to.be.undefined;
      });

      it('should not throw if label is null', () => {
        expect(() => new Edge(3, [], { label: null })).not.to.throw();
        expect(new Edge(3, [], { label: null }).label).to.be.undefined;
      });
    });

    it('should NOT throw with other types', () => {
      (() => new Edge(3, '2', { label: '2' })).should.not.throw();
      (() => new Edge('2', 3, { label: 3 })).should.not.throw();
      (() => new Edge([], true, { label: true })).should.not.throw();
      (() => new Edge({}, [], { label: [12, 2] })).should.not.throw();
      (() => new Edge(false, {}, { label: {} })).should.not.throw();
    });
  });
});

describe('Attributes', () => {
  let destinations, sources = destinations = [1, '65.231', 'adbfhs', false, [], { a: 'x' }];

  describe('source', () => {
    it('# should return the correct value for source', () => {
      sources.forEach(s => {
        let e = new Edge(s, 1);
        e.source.should.eql(s);
      });
    });
  });

  describe('destination', () => {
    it('# should return the correct value for destination', () => {
      destinations.forEach(d => {
        let e = new Edge('xc', d);
        e.destination.should.eql(d);
      });
    });
  });

  describe('weight', () => {
    let weights = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return the correct weight', () => {
      weights.forEach(w => {
        let e = new Edge(choose(sources), choose(destinations), { weight: w });
        e.weight.should.eql(Number.parseFloat(w));
      });
    });
  });

  describe('label', () => {
    it('# should return the correct label', () => {
      sources.forEach(label => {
        let e = new Edge(choose(sources), choose(destinations), { label: label });
        e.label.should.eql(label);
      });
    });
  });
});

describe('Methods', () => {
  describe('hasNegativeWeight()', () => {
    it('# should return true iff the edge\'s weight is negative', () => {
      let weights = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
      weights.forEach(w => {
        let e = new Edge('a', 'b', { weight: w });
        e.hasNegativeWeight().should.eql(Number.parseFloat(w) < 0);
      });
    });

    it('# should return false for weight === 0', () => {
      let e = new Edge('a', 'b', { weight: 0 });
      e.hasNegativeWeight().should.be.false();
    });

    it('# should return false when initialized with a non empty array', () => {

    });
  });

  describe('hasNegativeWeight()', () => {
    it('# should return true iff the edge\'s weight is negative', () => {
      let weights = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
      weights.forEach(w => {
        let e = new Edge('a', 'b', { weight: w });
        e.hasNegativeWeight().should.eql(Number.parseFloat(w) < 0);
      });
    });

    it('# should return false for weight === 0', () => {
      let e = new Edge('a', 'b', { weight: 0 });
      e.hasNegativeWeight().should.be.false();
    });
  });

  describe('isLoop()', () => {
    let sources = [1, '1', 'fdfd', true, [1, 2, 3], { 1: 2 }];
    it('# should return true if source and destination are the same value (and reference)', () => {
      sources.forEach(s => {
        let e = new Edge(s, s);
        e.isLoop().should.be.true();
      });
    });

    it('# should return false if source and destination are NOT the same value', () => {
      sources.forEach(s => {
        let e = new Edge(s, 'xyz');
        e.isLoop().should.be.false();
      });
    });

    it('# should NOT use reference equality', () => {
      let e = new Edge([1, 4, 65], [1, 4, 65]);
      e.isLoop().should.be.true();
      e = new Edge([1, 4, 65], [65, 1, 4]);
      e.isLoop().should.be.false();
      e = new Edge({ a: 1 }, { a: 1 });
      e.isLoop().should.be.true();
      e = new Edge({ a: [1, 2, 3] }, { a: [1, 2, 3] });
      e.isLoop().should.be.true();
    });

    it('# should do deep comparison', () => {
      let s = { a: 3, b: { c: [1, 2, 3], d: [1] } };
      let d = { a: 3, b: { c: [1, 2, 3], d: [1] } };
      let e = new Edge(s, d);
      e.isLoop().should.be.true();
      d = { a: 3, b: { c: [1, 2, 3, 4], d: [true, false] } };
      e = new Edge(s, d);
      e.isLoop().should.be.false();
    });
  });

  describe('hasLabel()', () => {
    it('# should return true iff the edge has a defined label', () => {
      let labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
      labels.forEach(label => {
        let e = new Edge('a', 'b', { label: label });
        e.hasLabel().should.be.true();
      });
    });

    it('# should return false label === undefined', () => {
      new Edge(1, 2).hasLabel().should.be.false();
    });
  });

  describe('equals()', () => {
    let labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return true if two edges are equals in all their fields', () => {
      labels.forEach(label => {
        let source = choose(labels);
        let dest = choose(labels);
        let weight = Math.random()
        let e1 = new Edge(source, dest, { label: label, weight: weight });
        let e2 = new Edge(source, dest, { label: label, weight: weight });
        e1.equals(e2).should.be.true();
      });
    });

    it('# should return false if the argument is not an edge', () => {
      labels.forEach(label => {
        let source = choose(labels);
        let dest = choose(labels);
        let weight = Math.random()
        let e1 = new Edge(source, dest, { label: label, weight: weight });
        e1.equals(choose(labels)).should.be.false();
      });
    });

    it('# should return false if source is different', () => {
      labels.forEach(label => {
        let source1 = choose(labels);
        let source2 = choose(labels);
        let dest = choose(labels);
        let weight = Math.random();
        let e1 = new Edge(source1, dest, { label: label, weight: weight });
        let e2 = new Edge(source2, dest, { label: label, weight: weight });
        e1.equals(e2).should.be.eql(consistentStringify(source1) === consistentStringify(source2));
      });
    });

    it('# should return false if dest is different', () => {
      labels.forEach(label => {
        let source = choose(labels);
        let dest1 = choose(labels);
        let dest2 = choose(labels);
        let weight = Math.random();
        let e1 = new Edge(source, dest1, { label: label, weight: weight });
        let e2 = new Edge(source, dest2, { label: label, weight: weight });
        e1.equals(e2).should.be.eql(consistentStringify(dest1) === consistentStringify(dest2));
      });
    });

    it('# should return false if label is different', () => {
      labels.forEach(source => {
        let dest = choose(labels);
        let label1 = choose(labels);
        let label2 = choose(labels);
        let weight = Math.random();
        let e1 = new Edge(source, dest, { label: label1, weight: weight });
        let e2 = new Edge(source, dest, { label: label2, weight: weight });
        e1.equals(e2).should.be.eql(consistentStringify(label1) === consistentStringify(label2));
      });
    });

    it('# should return false if weight is different', () => {
      labels.forEach(source => {
        let dest = choose(labels);
        let label = choose(labels);
        let weight1 = Math.random();
        let weight2 = Math.random();
        let e1 = new Edge(source, dest, { label: label, weight: weight1 });
        let e2 = new Edge(source, dest, { label: label, weight: weight2 });
        e1.equals(e2).should.be.eql(consistentStringify(weight1) === consistentStringify(weight2));
      });
    });
  });

  describe('labelEquals()', () => {
    let labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return true if the edge\'s label is (deeply)equal to the argument', () => {
      labels.forEach(label => {
        let source = choose(labels);
        let dest = choose(labels);
        let e = new Edge(source, dest, { label: label });
        e.labelEquals(label).should.be.true();
      });
    });

    it('# should return false iff label is different', () => {
      labels.forEach(label => {
        let source = choose(labels);
        let dest = choose(labels);
        let label2 = choose(labels);
        let e = new Edge(source, dest, { label: label });
        e.labelEquals(label2).should.be.eql(consistentStringify(label) === consistentStringify(label2));
      });
    });
  });

  describe('clone()', () => {
    let labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14', { "a": [true, { false: 3.0 }] }];
    it('# should clone all fields', () => {
      labels.forEach(label => {
        let source = choose(labels);
        let dest = choose(labels);
        let e1 = new Edge(source, dest, { label: label, weight: Math.random() });
        let e2 = e1.clone();
        e1.equals(e2).should.be.true();
      });
    });

    it('# changing the cloned instance should not affect the original', () => {
      let e1 = new Edge([1, 2, { 3: '3' }], { 'a': [true, { false: 3.0 }] }, { label: choose(labels), weight: Math.random() });
      let e2 = e1.clone();
      let e3 = e2.clone();

      e1.equals(e2).should.be.true();
      e1.equals(e3).should.be.true();
      e3.equals(e2).should.be.true();

      e2.source[2][1] = 'new';
      e1.equals(e2).should.be.false();
      e1.source.should.eql([1, 2, { 3: '3' }]);
      e2.source.should.eql([1, 2, { 3: '3', 1: 'new' }]);
      e1.equals(e3).should.be.true();

      e3.destination['a'] = 'changed';
      e1.equals(e3).should.be.false();
      e1.destination.should.eql({ 'a': [true, { false: 3.0 }] });
      e3.destination.should.eql({ 'a': 'changed' });
    });
  });

  describe('toJson()', () => {
    let labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return a valid json', () => {
      labels.forEach(label => {
        let source = choose(labels);
        let dest = choose(labels);
        let weight = Math.random();
        let e = new Edge(source, dest, { label: label, weight: weight });
        expect(() => JSON.parse(e.toJson())).not.to.throw();
      });
    });

    it('# should stringify the fields consistently', () => {
      let e = new Edge(0, '1', { label: 'label', weight: -0.1e14 });
      e.toJson().should.eql('{"destination":"1","label":"label","source":0,"weight":-10000000000000}');
    });

    it('# should deep-stringify all the fields', () => {
      let source = { a: 1, b: [{ c: 'cLab' }, 4] };
      let dest = [1, 2, 3, [4, 5, 6]];
      let label = "undefined label"
      let weight = 1.1e4;
      let e = new Edge(source, dest, { label: label, weight: weight });
      e.toJson().should.eql('{"destination":["1","2","3","[\\\"4\\\",\\\"5\\\",\\\"6\\\"]"],"label":"undefined label","source":{"a":1,"b":["{\\\"c\\\":\\\"cLab\\\"}","4"]},"weight":11000}');
    });
  });

  describe('fromJson()', () => {
    it('# should parse the fields consistently', () => {
      let e = new Edge(0, '1', { label: 'label', weight: -0.1e14 });
      Edge.fromJsonObject(JSON.parse(e.toJson())).should.eql(e);
    });

    it('# should deep-parse all the fields', () => {
      let source = { a: 1, b: [{ c: 'cLab' }, 4] };
      let dest = [1, 2, 3, new Set([1, 2, 3])];
      let label = "label";
      let weight = 1.1e4;
      let e = new Edge(source, dest, { label: label, weight: weight });
      Edge.fromJsonObject(JSON.parse(e.toJson())).should.eql(e);
    });
  });
});