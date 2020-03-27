import 'mjs-mocha';

import EmbeddedEdge from '../../../src/graph/embedding/embedded_edge.js';
import EmbeddedVertex from '../../../src/graph/embedding/embedded_vertex.js';

import { testAPI, testStaticAPI } from '../../utils/test_common.js';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_LABEL } from '../../../src/common/errors.js';

import chai from "chai";
import should from "should";
import Point2D from '../../../src/geometric/point2d.js';
import Vertex from '../../../src/graph/vertex.js';

const expect = chai.expect;

describe('EmbeddedEdge API', () => {

  it('# Class should have a constructor method', function () {
    EmbeddedEdge.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    const staticMethods = ['fromJson', 'fromJsonObject'];
    testStaticAPI(EmbeddedEdge, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    const embeddedEdge = new EmbeddedEdge(new EmbeddedVertex("a", new Point2D(1, 1)), new EmbeddedVertex("b", new Point2D(2, 2)));
    const methods = ['constructor', 'toJsonObject', 'toString', 'toSvg', 'clone'];
    const attributes = ['isDirected', 'arcControlDistance'];
    testAPI(embeddedEdge, attributes, methods);
  });
});

describe('EmbeddedEdge Creation', () => {
  const point = new Point2D(1, 2);
  const u = new EmbeddedVertex('u', point);
  const v = new EmbeddedVertex('v', point);

  describe('# Parameters', () => {
    describe('# 1st argument (mandatory)', () => {
      it('should throw when source is null or undefined', () => {
        (() => new EmbeddedEdge(null, v)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'source', null));
        (() => new EmbeddedEdge(undefined, v)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'source', undefined));
      });

      it('should throw when source is not an EmbeddedVertex', () => {
        (() => new EmbeddedEdge(new Map(), v)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'source', new Map()));
        (() => new EmbeddedEdge(new Set(), v)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'source', new Set()));
        const w = new Vertex('simple vertex');
        (() => new EmbeddedEdge(w, v)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'source', w));
      });

      it('should set source correctly when an EmbeddedVertex is passed', () => {
        (() => new EmbeddedEdge(u, v)).should.not.throw();
        const e = new EmbeddedEdge(u, v);
        e.source.equals(u).should.be.true();
      });
    });

    describe('# 2nd argument (mandatory)', () => {
      it('should throw when destination is null or undefined', () => {
        (() => new EmbeddedEdge(u, null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'destination', null));
        (() => new EmbeddedEdge(u, undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'destination', undefined));
      });

      it('should throw when destination is not an EmbeddedVertex', () => {
        (() => new EmbeddedEdge(u, new Map())).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'destination', new Map()));
        (() => new EmbeddedEdge(u, new Set())).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'destination', new Set()));
        const w = new Vertex('simple vertex');
        (() => new EmbeddedEdge(u, w)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'destination', w));
      });

      it('should set destination correctly when an EmbeddedVertex is passed', () => {
        (() => new EmbeddedEdge(u, v)).should.not.throw();
        const e = new EmbeddedEdge(u, v);
        e.destination.equals(v).should.be.true();
      });
    });

    describe('# isDirected (optional)', () => {
      it('should default to false', () => {
        new EmbeddedEdge(u, v).isDirected().should.be.false();
      });

      it('should throw if it\'s not a boolean', () => {
        (() => new EmbeddedEdge(u, v, { isDirected: 'r' })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'isDirected', 'r'));
        (() => new EmbeddedEdge(u, v, { isDirected: [] })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'isDirected', []));
        (() => new EmbeddedEdge(u, v, { isDirected: 12 })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'isDirected', 12));
        (() => new EmbeddedEdge(u, v, { isDirected: {} })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'isDirected', {}));
      });

      it('should set it correctly when boolean values are passed', () => {
        new EmbeddedEdge(u, v, { isDirected: true }).isDirected().should.be.true();
        new EmbeddedEdge(u, v, { isDirected: false }).isDirected().should.be.false();
      });
    });

    describe('# arcControlDistance (optional)', () => {
      it('should default to DEFAULT_EDGE_LOOP_RADIUS, for loops', () => {
        new EmbeddedEdge(u, u).arcControlDistance.should.eql(EmbeddedEdge.DEFAULT_EDGE_LOOP_RADIUS);
        new EmbeddedEdge(v, v).arcControlDistance.should.eql(EmbeddedEdge.DEFAULT_EDGE_LOOP_RADIUS);
      });

      it('should default to DEFAULT_EDGE_BEZIER_CONTROL_DISTANCE, for non-loops', () => {
        new EmbeddedEdge(u, v).arcControlDistance.should.eql(EmbeddedEdge.DEFAULT_EDGE_BEZIER_CONTROL_DISTANCE);
      });

      it('should throw if it\'s not numberic', () => {
        (() => new EmbeddedEdge(u, v, { arcControlDistance: 'r' })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'arcControlDistance', 'r'));
        (() => new EmbeddedEdge(u, v, { arcControlDistance: [] })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'arcControlDistance', []));
        (() => new EmbeddedEdge(u, v, { arcControlDistance: {} })).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'arcControlDistance', {}));
      });

      it('should set it correctly when numeric values are passed', () => {
        new EmbeddedEdge(u, v, { arcControlDistance: 11 }).arcControlDistance.should.eql(11);
        new EmbeddedEdge(u, v, { arcControlDistance: -11 }).arcControlDistance.should.be.eql(-11);
        new EmbeddedEdge(u, v, { arcControlDistance: '3.14' }).arcControlDistance.should.eql(3.14);
      });
    });
  });
});

describe('Attributes', () => {

});

describe('Methods', () => {
  const point = new Point2D(1, 2);
  const u = new EmbeddedVertex(['u'], point);
  const v = new EmbeddedVertex({ name: ['v'] }, point);

  describe('toJson()', () => {
    it('# should return a valid json', () => {
      const e = new EmbeddedEdge(u, v, { weight: 12, label: 'edge', arcControlDistance: -32, isDirected: true });
      JSON.parse(e.toJson()).should.eql({
        source: { "label": ["u"], "weight": 1, "position": "[1,2]" },
        destination: { "label": { "name": ["v"] }, "weight": 1, "position": "[1,2]" },
        weight: 12,
        arcControlDistance: -32,
        directed: true,
        label: "edge"
      });
    });
  });

  describe('fromJson()', () => {
    const w = new EmbeddedVertex(['test', {'test': true}], new Point2D(2.5, 0.12345), { weight: 1.5, vertexRadius: 10 });
    it('# applyed to the result of toJson, it should match source vertex', () => {
      const e = new EmbeddedEdge(u, w, { weight: 12, label: 'long edge', arcControlDistance: -3.14, isDirected: true });
      const e1 = EmbeddedEdge.fromJson(e.toJson());
      e1.should.eql(e);
      e1.source.equals(e.source).should.be.true();
      e1.destination.equals(e.destination).should.be.true();
      e1.label.should.eql(e.label);
      e1.weight.should.eql(e.weight);
      e1.arcControlDistance.should.eql(e.arcControlDistance);
      e1.isDirected().should.eql(e.isDirected());
    });
  });


  describe('toSvg()', () => {
    it('# should return a valid svg', () => {
      let v = new EmbeddedVertex("v", new Point2D(20, 20), { weight: 0.8 })
      let u = new EmbeddedVertex("u", new Point2D(120, 70), { weight: 2 })
      let edge = new EmbeddedEdge(u, v, { weight: 2, label: "Edge!" });
      let edge2 = new EmbeddedEdge(v, u, { weight: 5, label: "test" });
      console.log(edge.toSvg());
      console.log(edge2.toSvg());
      console.log(v.toSvg());
      console.log(u.toSvg());
    });

    it('# should return a valid svg 2 ', () => {
      let v = new EmbeddedVertex("v", new Point2D(50, 170), { weight: 0.8 })
      let u = new EmbeddedVertex("u", new Point2D(320, 250), { weight: 2 })
      let edge = new EmbeddedEdge(u, v, { weight: 2, label: "Edge!", isDirected: true });
      let edge2 = new EmbeddedEdge(v, u, { weight: 5, label: "test", isDirected: true });
      let loop = new EmbeddedEdge(v, v, { weight: 5, label: "loop long", isDirected: false });
      let loop2 = new EmbeddedEdge(u, u, { weight: 2, label: "loop", isDirected: true });
      console.log(v.toSvg());
      console.log(u.toSvg());
      console.log(edge.toSvg({ useArcs: true }));
      console.log(edge.toSvg());
      console.log(edge2.toSvg({ useArcs: true }));
      console.log(loop.toSvg());
      console.log(loop2.toSvg());
    });
  });
});