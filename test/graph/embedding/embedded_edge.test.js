import 'mjs-mocha';

import EmbeddedEdge from '../../../src/graph/embedding/embedded_edge.js';
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

describe('EmbeddedEdge API', () => {

  it('# Class should have a constructor method', function () {
    EmbeddedEdge.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = [];
    testStaticAPI(EmbeddedEdge, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let embeddedGraph = new EmbeddedEdge(new EmbeddedVertex("a", new Point(1,1)), new EmbeddedVertex("b", new Point(2,2)));
    let methods = ['constructor', 'toJson', 'toString', 'toSvg', 'clone'];
    let attributes = [];
    testAPI(embeddedGraph, attributes, methods);
  });
});

describe('EmbeddedEdge Creation', () => {
  describe('# Parameters', () => {
    let point = new Point(1,2,3);
    describe('# 1st argument (mandatory)', () => {
      // it('should throw when label is null or undefined', () => {
      //   (() => new EmbeddedEdge(null, point)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'label', null));
      //   (() => new EmbeddedEdge(undefined, point)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'label', undefined));
      // });

      // it('should throw when source is not a Vertex', () => {
      //   (() => new EmbeddedEdge(new Map(), point)).should.throw(ERROR_MSG_INVALID_LABEL('Vertex()', 'label', new Map()));
      //   (() => new EmbeddedEdge(new Set(), point)).should.throw(ERROR_MSG_INVALID_LABEL('Vertex()', 'label', new Set()));
      // });
    });

    describe('# 2nd argument (mandatory)', () => {
    });

    describe('# 3rd argument (optional)', () => {
      // it('should default to weight=1', () => {
      //   new EmbeddedEdge(2, 1).weight.should.eql(1);
      // });

      // it('should throw if it\'s not a number', () => {
      //   (() => new EmbeddedEdge(3, [], { weight: 'r' })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'weight', 'r'));
      //   (() => new EmbeddedEdge(3, [], { weight: [] })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'weight', []));
      //   (() => new EmbeddedEdge(3, [], { weight: false })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'weight', false));
      //   (() => new EmbeddedEdge(3, [], { weight: {} })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'weight', {}));
      // });

      // it('should NOT throw with numbers', () => {
      //   (() => new EmbeddedEdge(2, [], { weight: 1 })).should.not.throw();
      //   (() => new EmbeddedEdge(2, [], { weight: 0.1 })).should.not.throw();
      //   (() => new EmbeddedEdge(2, [], { weight: -145 })).should.not.throw();
      // });

      // it('should NOT throw with numeric strings', () => {
      //   (() => new EmbeddedEdge(2, [], { weight: '1' })).should.not.throw();
      //   (() => new EmbeddedEdge(2, [], { weight: '3.1415' })).should.not.throw();
      //   (() => new EmbeddedEdge(2, [], { weight: '-145' })).should.not.throw();
      //   (() => new EmbeddedEdge(2, [], { weight: '1e12' })).should.not.throw();
      // });
    });

    describe('# 4th argument (optional)', () => {
      // it('should default to label=undefined', () => {
      //   expect(new EmbeddedEdge(2, 1).label).to.be.undefined;
      //   expect(new EmbeddedEdge(2, 1, { weight: -1 }).label).to.be.undefined;
      // });

      // it('should not throw if label is null', () => {
      //   expect(() => new EmbeddedEdge(3, [], { label: null })).not.to.throw();
      //   expect(new EmbeddedEdge(3, [], { label: null }).label).to.be.undefined;
      // });
      
      // it('should not throw if label is a string', () => {
      //   expect(() => new EmbeddedEdge(3, [], { label: '' })).not.to.throw();
      //   expect(() => new EmbeddedEdge(3, [], { label: 'some string' })).not.to.throw();
      //   expect(() => new EmbeddedEdge(3, [], { label: 'unicode! ☺☺☻' })).not.to.throw();
      // });

      // it('should throw with other types', () => {
      //   (() => new EmbeddedEdge('2', 3, { label: 3 })).should.throw();
      //   (() => new EmbeddedEdge([], true, { label: true })).should.throw();
      //   (() => new EmbeddedEdge({}, [], { label: [12, 2] })).should.throw();
      //   (() => new EmbeddedEdge(false, {}, { label: {} })).should.throw();
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
      //   let e = new EmbeddedEdge(source, dest, { label: label, weight: weight });
      //   expect(() => JSON.parse(e.toJson())).not.to.throw();
      // });
    });

    it('# should stringify the fields consistently', () => {
      // let e = new EmbeddedEdge(0, '1', { label: 'label', weight: -0.1e14 });
      // e.toJson().should.eql('{"destination":"1","label":"label","source":0,"weight":-10000000000000}');
    });

    it('# should deep-stringify all the fields', () => {
      // let source = { a: 1, b: [{ c: 'cLab' }, 4] };
      // let dest = [1, 2, 3, [4, 5, 6]];
      // let label = "undefined label"
      // let weight = 1.1e4;
      // let e = new EmbeddedEdge(source, dest, { label: label, weight: weight });
      // e.toJson().should.eql('{"destination":["1","2","3","[\\\"4\\\",\\\"5\\\",\\\"6\\\"]"],"label":"undefined label","source":{"a":1,"b":["{\\\"c\\\":\\\"cLab\\\"}","4"]},"weight":11000}');
    });
  });

  describe('toSvg()', () => {
    it('# should return a valid svg', () => {
      let v = new EmbeddedVertex("v", new Point(20, 20), {weight: 0.8})
      let u = new EmbeddedVertex("u", new Point(120, 70), {weight: 2})
      let edge = new EmbeddedEdge(u, v, {weight: 2, label: "Edge!"});
      let edge2 = new EmbeddedEdge(v, u, {weight: 5, label: "test"});
      console.log(edge.toSvg());
      console.log(edge2.toSvg());
      console.log(v.toSvg());
      console.log(u.toSvg());
    });

    it('# should return a valid svg 2 ', () => {
      let v = new EmbeddedVertex("v", new Point(20, 70), {weight: 0.8})
      let u = new EmbeddedVertex("u", new Point(120, 20), {weight: 2})
      let edge = new EmbeddedEdge(u, v, {weight: 2, label: "Edge!"});
      let edge2 = new EmbeddedEdge(v, u, {weight: 5, label: "test"});
      console.log(edge.toSvg());
      console.log(edge2.toSvg());
      console.log(v.toSvg());
      console.log(u.toSvg());
    });    
  });
});