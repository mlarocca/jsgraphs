import 'mjs-mocha';

import Edge from '../../src/graph/edge.mjs';

import Vertex from '../../src/graph/vertex.mjs';

import { choose } from '../../src/common/array.mjs';
import { testAPI, testStaticAPI } from '../utils/test_common.mjs';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../src/common/errors.mjs';

import chai from "chai";
import should from "should";   // lgtm[js/unused-local-variable]

const expect = chai.expect;

describe('Edge API', () => {

  it('# Class should have a constructor method', function () {
    Edge.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    const staticMethods = ['compareEdges', 'fromJson', 'fromJsonObject'];
    testStaticAPI(Edge, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    const edge = new Edge(new Vertex(1), new Vertex(2));
    const methods = ['constructor', 'hasNegativeWeight', 'isLoop', 'hasLabel', 'transpose', 'toJson', 'toJsonObject', 'toString', 'equals', 'clone'];
    const attributes = ['source', 'destination', 'weight', 'label', 'escapedLabel', 'id'];
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

      it('should throw when source is not a Vertex', () => {
        (() => new Edge(1)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'source', 1));
        (() => new Edge('0')).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'source', '0'));
        (() => new Edge(new Set())).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'source', new Set()));
        (() => new Edge(new Set())).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'source', new Set()));
      });
    });

    describe('# 2nd argument (mandatory)', () => {
      const v = new Vertex(1);
      it('should throw when destination is null or undefined', () => {
        (() => new Edge(v, null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', null));
        (() => new Edge(v, undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', undefined));
      });


      it('should throw when destination is not a Vertex', () => {
        (() => new Edge(v, 11)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', 11));
        (() => new Edge(v, '007')).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', '007'));
        (() => new Edge(v, new Set())).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', new Set()));
        (() => new Edge(v, new Set())).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', new Set()));
      });


      it('should NOT throw with vertices', () => {
        (() => new Edge(new Vertex(3), new Vertex(1))).should.not.throw();
      });
    });

    describe('# 3rd argument (optional)', () => {
      const u = new Vertex('u');
      const v = new Vertex(['v']);
      it('should default to weight=1', () => {
        new Edge(u, v).weight.should.eql(1);
      });

      it('should throw if it\'s not a number', () => {
        (() => new Edge(u, v, { weight: 'r' })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', 'r'));
        (() => new Edge(u, v, { weight: [] })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', []));
        (() => new Edge(u, v, { weight: false })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', false));
        (() => new Edge(u, v, { weight: {} })).should.throw(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', {}));
      });

      it('should NOT throw with numbers', () => {
        (() => new Edge(u, v, { weight: 1 })).should.not.throw();
        (() => new Edge(u, v, { weight: 0.1 })).should.not.throw();
        (() => new Edge(u, v, { weight: -145 })).should.not.throw();
      });

      it('should NOT throw with numeric strings', () => {
        (() => new Edge(u, v, { weight: '1' })).should.not.throw();
        (() => new Edge(u, v, { weight: '3.1415' })).should.not.throw();
        (() => new Edge(u, v, { weight: '-145' })).should.not.throw();
        (() => new Edge(u, v, { weight: '1e12' })).should.not.throw();
      });
    });

    describe('# 4th argument (optional)', () => {
      const u = new Vertex({ 1: 'u' });
      const v = new Vertex([false]);

      it('should default to label=undefined', () => {
        expect(new Edge(u, v).label).to.be.undefined;
        expect(new Edge(u, v, { weight: -1 }).label).to.be.undefined;
      });

      it('should not throw if label is null', () => {
        expect(() => new Edge(u, v, { label: null })).not.to.throw();
        expect(new Edge(u, v, { label: null }).label).to.be.undefined;
      });

      it('should not throw if label is a string', () => {
        expect(() => new Edge(u, v, { label: '' })).not.to.throw();
        expect(() => new Edge(u, v, { label: 'some string' })).not.to.throw();
        expect(() => new Edge(u, v, { label: 'unicode! ☺☺☻' })).not.to.throw();
      });

      it('should throw with other types', () => {
        (() => new Edge(u, v, { label: 3 })).should.throw();
        (() => new Edge(u, v, { label: true })).should.throw();
        (() => new Edge(u, v, { label: [12, 2] })).should.throw();
        (() => new Edge(u, v, { label: {} })).should.throw();
      });
    });
  });
});

describe('Attributes', () => {
  let destinations, sources = destinations = [1, '65.231', 'adbfhs', false, [], { a: 'x' }].map(name => new Vertex(name));

  describe('source', () => {
    it('# should return the correct value for source', () => {
      const v = new Vertex(1);
      sources.forEach(s => {
        const e = new Edge(s, v);
        e.source.should.eql(s);
      });
    });
  });

  describe('destination', () => {
    it('# should return the correct value for destination', () => {
      const v = new Vertex('xc');
      destinations.forEach(d => {
        const e = new Edge(v, d);
        e.destination.should.eql(d);
      });
    });
  });

  describe('weight', () => {
    const weights = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return the correct weight', () => {
      weights.forEach(w => {
        const e = new Edge(choose(sources), choose(destinations), { weight: w });
        e.weight.should.eql(Number.parseFloat(w));
      });
    });
  });

  describe('label', () => {
    it('# should return the correct label', () => {
      const labels = ['', '1', '-1e14', 'test n° 1', 'unicode ☻']
      labels.forEach(label => {
        const e = new Edge(choose(sources), choose(destinations), { label: label });
        e.label.should.eql(label);
      });
    });
  });

  describe('id', () => {
    it('# should return the correct id', () => {
      const labels = ['', '1', '-1e14', 'test n° 1', 'unicode ☻']
      sources.forEach(source => {
        let dest = choose(destinations);
        const e = new Edge(source, dest, { weight: Math.random(), label: choose(labels) });
        e.id.should.eql(`[${source.id}][${dest.id}]`);
      });
    });

    it('# should not be affected by options', () => {
      let u = choose(sources);
      let v;
      do {
        v = choose(destinations);
      } while (v.equals(u));
      let label = "random label";

      const e1 = new Edge(u, v, { weight: Math.random(), label: label });
      const e2 = new Edge(u, v, { weight: Math.random(), label: label });
      const e3 = new Edge(v, u, { weight: Math.random(), label: label });
      const e4 = new Edge(u, v, { weight: Math.random(), label: "another different label" });

      e1.id.should.eql(e2.id);
      e1.id.should.not.eql(e3.id);
      e2.id.should.not.eql(e3.id);
      e1.id.should.eql(e4.id);
    });
  });
});

describe('Methods', () => {
  const u = new Vertex({ 1: 'u' });
  const v = new Vertex([false]);
  const sources = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'].map(name => new Vertex(name));
  const labels = ['', '1', '-1e14', 'test n° 1', 'unicode ☻'];
  const weights = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];

  describe('hasNegativeWeight()', () => {
    it('# should return true iff the edge\'s weight is negative', () => {
      weights.forEach(w => {
        const e = new Edge(u, v, { weight: w });
        e.hasNegativeWeight().should.eql(Number.parseFloat(w) < 0);
      });
    });

    it('# should return false for weight === 0', () => {
      const e = new Edge(u, v, { weight: 0 });
      e.hasNegativeWeight().should.be.false();
    });

    it('# should return false when initialized with a non empty array', () => {

    });
  });

  describe('hasNegativeWeight()', () => {
    it('# should return true iff the edge\'s weight is negative', () => {
      weights.forEach(w => {
        const e = new Edge(u, v, { weight: w });
        e.hasNegativeWeight().should.eql(Number.parseFloat(w) < 0);
      });
    });

    it('# should return false for weight === 0', () => {
      const e = new Edge(u, v, { weight: 0 });
      e.hasNegativeWeight().should.be.false();
    });
  });

  describe('isLoop()', () => {
    const sources = [1, '1', 'fdfd', true, [1, 2, 3], { 1: 2 }].map(name => new Vertex(name));
    it('# should return true if source and destination are the same value (and reference)', () => {
      sources.forEach(s => {
        const e = new Edge(s, s);
        e.isLoop().should.be.true();
      });
    });

    it('# should return false if source and destination are NOT the same value', () => {
      sources.forEach(s => {
        const e = new Edge(s, new Vertex('xyz'));
        e.isLoop().should.be.false();
      });
    });

    it('# should NOT use reference equality', () => {
      let e = new Edge(new Vertex([1, 4, 65]), new Vertex([1, 4, 65]));
      e.isLoop().should.be.true();
      e = new Edge(new Vertex([1, 4, 65]), new Vertex([65, 1, 4]));
      e.isLoop().should.be.false();
      e = new Edge(new Vertex({ a: 1 }), new Vertex({ a: 1 }));
      e.isLoop().should.be.true();
      e = new Edge(new Vertex({ a: [1, 2, 3] }), new Vertex({ a: [1, 2, 3] }));
      e.isLoop().should.be.true();
    });

    it('# should do deep comparison', () => {
      const s = new Vertex({ a: 3, b: { c: [1, 2, 3], d: [1] } });
      let d = new Vertex({ a: 3, b: { c: [1, 2, 3], d: [1] } });
      let e = new Edge(s, d);
      e.isLoop().should.be.true();
      d = new Vertex({ a: 3, b: { c: [1, 2, 3, 4], d: [true, false] } });
      e = new Edge(s, d);
      e.isLoop().should.be.false();
    });
  });

  describe('hasLabel()', () => {
    const u = new Vertex('a');
    const v = new Vertex('b');

    it('# should return true iff the edge has a defined label', () => {
      const labels = ['1', '-1e14'];
      labels.forEach(label => {
        const e = new Edge(u, v, { label: label });
        e.hasLabel().should.be.true();
      });
    });

    it('# should return false label === undefined', () => {
      new Edge(v, u).hasLabel().should.be.false();
    });
  });

  describe('equals()', () => {
    it('# should return true if two edges are equals in all their fields', () => {
      labels.forEach(label => {
        const source = choose(sources);
        const dest = choose(sources);
        const weight = Math.random()
        const e1 = new Edge(source, dest, { label: label, weight: weight });
        const e2 = new Edge(source, dest, { label: label, weight: weight });
        e1.equals(e2).should.be.true();
      });
    });

    it('# should return false if the argument is not an edge', () => {
      labels.forEach(label => {
        const source = choose(sources);
        const dest = choose(sources);
        const weight = Math.random()
        const e1 = new Edge(source, dest, { label: label, weight: weight });
        e1.equals(choose(sources)).should.be.false();
      });
    });

    it('# should return false if source is different', () => {
      labels.forEach(label => {
        const source1 = choose(sources);
        const source2 = choose(sources);
        const dest = choose(sources);
        const weight = Math.random();
        const e1 = new Edge(source1, dest, { label: label, weight: weight });
        const e2 = new Edge(source2, dest, { label: label, weight: weight });
        e1.equals(e2).should.be.eql(source1.id === source2.id);
      });
    });

    it('# should return false if dest is different', () => {
      labels.forEach(label => {
        const source = choose(sources);
        const dest1 = choose(sources);
        const dest2 = choose(sources);
        const weight = Math.random();
        const e1 = new Edge(source, dest1, { label: label, weight: weight });
        const e2 = new Edge(source, dest2, { label: label, weight: weight });
        e1.equals(e2).should.be.eql(dest1.id === dest2.id);
      });
    });

    it('# should return false if label is different', () => {
      sources.forEach(source => {
        const dest = choose(sources);
        const label1 = choose(labels);
        const label2 = choose(labels);
        const weight = Math.random();
        const e1 = new Edge(source, dest, { label: label1, weight: weight });
        const e2 = new Edge(source, dest, { label: label2, weight: weight });
        e1.equals(e2).should.be.eql(label1 === label2);
      });
    });

    it('# should return false if weight is different', () => {
      sources.forEach(source => {
        const dest = choose(sources);
        const label = choose(labels);
        const weight1 = Math.random();
        const weight2 = Math.random();
        const e1 = new Edge(source, dest, { label: label, weight: weight1 });
        const e2 = new Edge(source, dest, { label: label, weight: weight2 });
        e1.equals(e2).should.be.eql(weight1 === weight2);
      });
    });
  });

  describe('clone()', () => {
    it('# should clone all fields', () => {
      labels.forEach(label => {
        const source = choose(sources);
        const dest = choose(sources);
        const e1 = new Edge(source, dest, { label: label, weight: Math.random() });
        const e2 = e1.clone();
        e1.equals(e2).should.be.true();
      });
    });

    it('# changing the cloned instance should not affect the original', () => {
      const e1 = new Edge(
        new Vertex([1, 2, { 3: '3' }], { weight: -1 }),
        new Vertex({ 'a': [true, { false: 3.0 }] }, { weight: 2 }),
        {
          label: choose(labels), weight: Math.random()
        });
      let e2 = e1.clone();
      let e3 = e2.clone();

      e1.equals(e2).should.be.true();
      e1.equals(e3).should.be.true();
      e3.equals(e2).should.be.true();

      e2.source.weight = 3.14;
      e1.equals(e2).should.be.false();
      e1.equals(e3).should.be.true();
      e1.source.weight.should.not.eql(e2.source.weight);
      e1.source.weight.should.eql(e3.source.weight);

      e3.destination.weight = 0.01;
      e1.equals(e3).should.be.false();
      e2.equals(e3).should.be.false();
      e2.destination.weight.should.not.eql(e3.destination.weight);
    });
  });

  describe('toJson()', () => {
    it('# should return a valid json', () => {
      labels.forEach(label => {
        const source = choose(sources);
        const dest = choose(sources);
        const weight = Math.random();
        const e = new Edge(source, dest, { label: label, weight: weight });
        expect(() => JSON.parse(e.toJson())).not.to.throw();
      });
    });

    it('# should stringify the fields consistently', () => {
      const e = new Edge(new Vertex(0), new Vertex('1', { weight: 2 }), { label: 'label', weight: -0.1e14 });
      JSON.parse(e.toJson()).should.eql(
        {
          source: { name: 0, weight: 1 },
          destination: { name: "1", weight: 2 },
          weight: -10000000000000,
          label: "label"
        });
    });

    it('# should deep-stringify all the fields', () => {
      const source = new Vertex({ a: 1, b: [{ c: 'cLab' }, 4] });
      const dest = new Vertex([1, 2, 3, [4, 5, 6]]);
      const label = "undefined label"
      const weight = 1.1e4;
      const e = new Edge(source, dest, { label: label, weight: weight });
      e.toJson().should.eql('{"destination":{"name":[1,2,3,[4,5,6]],"weight":1},"label":"undefined label","source":{"name":{"a":1,"b":[{"c":"cLab"},4]},"weight":1},"weight":11000}');
    });
  });

  describe('fromJson()', () => {
    it('# should parse the fields consistently', () => {
      const e = new Edge(new Vertex(0), new Vertex('1'), { label: 'label', weight: -0.1e14 });
      Edge.fromJsonObject(JSON.parse(e.toJson())).should.eql(e);
    });

    it('# should deep-parse all the fields', () => {
      const source = new Vertex({ a: 1, b: [{ c: 'cLab' }, 4] }, {weight: 2, label: 'v label', data: { a: 1, b: [{ c: 'cLab' }, 4] }});
      const dest = new Vertex([1, 2, 3, [4, 5, 6]]);
      const label = "label";
      const weight = 1.1e4;
      const e = new Edge(source, dest, { label: label, weight: weight });
      Edge.fromJsonObject(JSON.parse(e.toJson())).should.eql(e);
    });
  });
});