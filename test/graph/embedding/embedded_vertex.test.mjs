import 'mjs-mocha';

import EmbeddedVertex from '../../../src/graph/embedding/embedded_vertex.mjs';

import Point from '../../../src/geometric/point.mjs';
import Point2D from '../../../src/geometric/point2d.mjs';

import { testAPI, testStaticAPI } from '../../utils/test_common.mjs';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_LABEL } from '../../../src/common/errors.mjs';

import chai from "chai";
import should from "should";

const expect = chai.expect;

describe('EmbeddedVertex API', () => {
  it('# Class should have a constructor method', function () {
    EmbeddedVertex.should.be.a.constructor();
  });

  it('# Class should have a static fromJson method', function () {
    let staticMethods = ['fromJson', 'fromJsonObject'];
    testStaticAPI(EmbeddedVertex, staticMethods);
  });

  it('# Object\'s interface should be complete', () => {
    let embeddedVertex = new EmbeddedVertex("test", new Point2D(1, 2));
    let methods = ['constructor', 'radius', 'toJsonObject', 'toString', 'toSvg', 'clone'];
    let attributes = ['position'];
    testAPI(embeddedVertex, attributes, methods);
  });
});

describe('EmbeddedVertex Creation', () => {
  describe('# Parameters', () => {
    const point = new Point2D(1, 2);
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
      it('should throw when vertexPosition is null or undefined', () => {
        (() => new EmbeddedVertex(1, null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex()', 'vertexPosition', null));
        (() => new EmbeddedVertex('1', undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex()', 'vertexPosition', undefined));
      });

      it('should throw when vertexPosition is a Point with dimension 3 or more', () => {
        let q = new Point(1, 2, 3);
        (() => new EmbeddedVertex(1, q)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex()', 'vertexPosition', q));
        q = new Point(1, 2, 3, 4, 5, 6);
        (() => new EmbeddedVertex('1', q)).should.throw(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex()', 'vertexPosition', q));
      });

      it('should NOT throw with Point2D', () => {
        (() => new EmbeddedVertex(3, point)).should.not.throw();
      });
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
  const p = new Point2D(0.1, -2.4);

  describe('position', () => {
    it('# should return a valid point', () => {
      const v = new EmbeddedVertex('v', p);
      v.position.coordinates().should.eql(p.coordinates());
    });

    it('# should update the point when set', () => {
      const q = new Point2D(3, 1);
      const v = new EmbeddedVertex('v', p);
      v.position.should.eql(p);
      v.position = q;
      v.position.should.eql(q);
    });
  });
});

describe('Methods', () => {
  describe('toJson()', () => {
    const v = new EmbeddedVertex('test', new Point2D(2, 0), { weight: 1.5 });

    it('# should return a valid json', () => {
      JSON.parse(v.toJson()).should.not.throw();
    });

    it('# should stringify the fields consistently', () => {
      JSON.parse(v.toJson()).should.eql(
        { label: 'test', position: '[2,0]', weight: 1.5 }
      );
    });
  });

  describe('fromJson()', () => {
    const v = new EmbeddedVertex(['test', {'test': true}], new Point2D(2.5, 0.12345), { weight: 1.50 });
    it('# applyed to the result of toJson, it should match source vertex', () => {
      const u = EmbeddedVertex.fromJson(v.toJson());
      u.equals(v).should.be.true();
      u.position.coordinates().should.eql(v.position.coordinates());
    });
  });

  describe('toSvg()', () => {
    it('# should return a valid svg', () => {
      let vertex = new EmbeddedVertex("test", new Point2D(10, 10), { weight: 10 });
      console.log(vertex.toSvg());
    });
  });
});