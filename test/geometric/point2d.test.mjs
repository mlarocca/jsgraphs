import Point2D from '../../src/geometric/point2d.mjs';
import { isUndefined } from '../../src/common/basic.mjs';
import { ERROR_MSG_PARAM_TYPE } from '../../src/common/errors.mjs';
import { testAPI, testStaticAPI } from '../utils/test_common.mjs';

import 'mjs-mocha';
import chai from "chai";
import should from "should";   // lgtm[js/unused-local-letiable]
const expect = chai.expect;

const ERROR_MSG_PARAM_INVALID_POINT = (fname, val, dimension, pname = 'point') => `Illegal argument for ${fname}: ${pname} = ${val} must be of class Point${isUndefined(dimension) ? '' : ` (${dimension}D)`}`;

describe('Point2D API', () => {
  it('# should have a constructor method', function () {
    Point2D.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let point = new Point2D(1, 2);

    let methods = ['constructor', 'add', 'subtract', 'dotProduct', 'clone'];
    let superMethods = ['coordinates', 'coordinate', 'equals', 'distanceTo', 'maxDistance', 'minDistance', 'toString', 'toJson', 'dimensionality'];
    let attributes = ['x', 'y'];
    testAPI(point, attributes, methods, superMethods);
  });

  it('# Static methods', () => {
    let staticMethods = ['fromJson', 'validatePoint', 'random'];
    testStaticAPI(Point2D, staticMethods);
  });
});

describe('Point2D Creation', () => {
  describe('# Parameters', () => {
    it('should throw when no key is passed', () => {
      expect(() => new Point2D()).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [undefined, undefined], 'sequence of numbers'));
    });

    it('should throw when x is not a number', () => {
      expect(() => new Point2D(null)).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [null, undefined], 'sequence of numbers'));
      expect(() => new Point2D('a')).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', ['a', undefined], 'sequence of numbers'));
      expect(() => new Point2D([])).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [[], undefined], 'sequence of numbers'));
      expect(() => new Point2D({ '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [{ '4': 4 }, undefined], 'sequence of numbers'));
    });

    it('should throw when y is not a number', () => {
      expect(() => new Point2D(1, null)).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [1, null], 'sequence of numbers'));
      expect(() => new Point2D(2, 'erwer')).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [2, 'erwer'], 'sequence of numbers'));
      expect(() => new Point2D(3, [])).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [3, []], 'sequence of numbers'));
      expect(() => new Point2D(4, { '4': 4 })).to.throw(ERROR_MSG_PARAM_TYPE('constructor', 'coordinates', [4, { '4': 4 }], 'sequence of numbers'));
    });

    it('should not throw with valid parameters', () => {
      expect(() => new Point2D(1, 2)).not.to.throw();
      expect(() => new Point2D(0, 3.1415)).not.to.throw();
      expect(() => new Point2D(Number.MAX_VALUE, Number.MAX_VALUE)).not.to.throw();
      expect(() => new Point2D(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).not.to.throw();
    });
  });
});

describe('Attributes', () => {
  let point;
  let point2;
  const x1 = 23;
  const y1 = -45;
  const x2 = Number.MAX_SAFE_INTEGER;
  const y2 = 2.1547889;

  before(function () {
    point = new Point2D(x1, y1);
    point2 = new Point2D(x2, y2);
  });

  describe('x', () => {
    it('should hold the correct value', () => {
      point.x.should.equal(x1);
      point2.x.should.equal(x2);
    });
  });

  describe('y', () => {
    it('should return the correct value', () => {
      point.y.should.equal(y1);
      point2.y.should.equal(y2);
    });
  });

  describe('dimensionality', () => {
    it('should hold the correct value (2)', () => {
      point.dimensionality.should.equal(2);
      point2.dimensionality.should.equal(2);
    });
  });
});

describe('Static Methods', () => {
  describe('validatePoint()', () => {
    describe('API', () => {
      it('should expect 1 parameter', () => {
        Point2D.validatePoint.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => Point2D.validatePoint()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', undefined));
      });

    });

    describe('Behaviour', () => {
      it('should throw if the argument is not a valid point', () => {
        expect(() => Point2D.validatePoint(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', 1));
        expect(() => Point2D.validatePoint(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', false));
        expect(() => Point2D.validatePoint('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', 's'));
        expect(() => Point2D.validatePoint([])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', []));
        expect(() => Point2D.validatePoint({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('validatePoint', { '4': 4 }));
      });

      it('should throw if the coordinates are not valid', () => {
        class StrangePoint2D extends Point2D {
          coordinates() {
            return ['s', 2];
          }
        }
        expect(() => Point2D.validatePoint(new StrangePoint2D(1, 2))).to.throw(ERROR_MSG_PARAM_TYPE('validatePoint', 'coordinates', ['s', 2], 'sequence of numbers'));
      });

      it('should accept an optional function name', () => {
        expect(() => Point2D.validatePoint(null, 'test')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('test', null));
      });
    });
  });

  describe('random()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        Point2D.random.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      it('should return a Point', () => {
        expect(Point2D.random()).to.be.an.instanceOf(Point2D);
      });

      it('should return a Point with the right number of coordinates', () => {
        Point2D.random().dimensionality.should.equal(2);
      });

      it('should return a random Point', () => {
        let a = Point2D.random();
        let b = Point2D.random();
        a.equals(b).should.false();
      });
    });
  });
});

describe('Methods', () => {
  let point;
  let point2;
  const x1 = 23;
  const y1 = -45;
  const x2 = Number.MAX_SAFE_INTEGER;
  const y2 = 2.1547889;

  before(function () {
    point = new Point2D(x1, y1);
    point2 = new Point2D(x2, y2);
  });

  describe('coordinates()', () => {
    describe('API', () => {
      it('should expect no arguments', () => {
        point.coordinates.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      it('should return the correct value', () => {
        point.coordinates().should.be.eql([x1, y1]);
        point2.coordinates().should.be.eql([x2, y2]);
      });
    });
  });

  describe('equals()', () => {
    describe('API', () => {
      it('should expect 1 argument', () => {
        point.equals.length.should.eql(1);
      });
    });

    describe('Behaviour', () => {
      it('should return false if the argument is not a point', () => {
        point.equals().should.be.false();
        point2.equals().should.be.false();
      });

      it('should return false if the argument is a point with different coordinates', () => {
        point.equals(point2).should.be.false();
        point.equals(new Point2D(point.x, point.y + 1)).should.be.false();
        point.equals(new Point2D(Math.random(), Math.random())).should.be.false();
      });

      it('should return true if the argument is a point with the same coordinates', () => {
        point.equals(point).should.be.true();
        point.equals(new Point2D(point.x, point.y)).should.be.true();
        let [x, y] = [Math.random(), Math.random()];
        let p1 = new Point2D(x, y);
        let p2 = new Point2D(x, y);
        p1.equals(p2).should.be.true();
      });
    });
  });

  describe('toString()', () => {
    describe('API', () => {
      it('should expect no arguments', () => {
        point.toString.length.should.eql(0);
      });
    });

    describe('Behaviour', () => {
      it('should return the string representation of a point', () => {
        point.toString().should.equal(`(${x1},${y1})`);
        point2.toString().should.equal(`(${x2},${y2})`);
        new Point2D(1, 2).toString().should.equal('(1,2)');
      });
    });
  });

  describe('distanceTo()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        point.distanceTo.length.should.eql(1);
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => point.distanceTo(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', 1));
        expect(() => point.distanceTo(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', false));
        expect(() => point.distanceTo('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', 's'));
        expect(() => point.distanceTo([])).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', []));
        expect(() => point.distanceTo({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('distanceTo', { '4': 4 }));
      });

      it('should throw if the coordinates are not valid', () => {
        class StrangePoint2D extends Point2D {
          coordinates() {
            return ['s', 2];
          }
        }
        expect(() => point.distanceTo(new StrangePoint2D(1, 2))).to.throw(ERROR_MSG_PARAM_TYPE('distanceTo', 'coordinates', ['s', 2], 'sequence of numbers'));
      });
    });

    describe('Behaviour', () => {
      it('should return the correct Euclidean distance', () => {
        point = new Point2D(0, 0);
        point2 = new Point2D(3, 4);
        point.distanceTo(point2).should.be.eql(5);
        point2.distanceTo(point).should.be.eql(5);
        point.distanceTo(point).should.be.eql(0);
        point2.distanceTo(point2).should.be.eql(0);
        point = new Point2D(2, 3);
        point.distanceTo(point2).should.be.eql(Math.sqrt(2));
      });
    });
  });


  describe('add()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        point.add.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => point.add()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('add', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => point.add(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('add', 1));
        expect(() => point.add(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('add', false));
        expect(() => point.add('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('add', 's'));
        expect(() => point.add({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('add', { '4': 4 }));
      });
    });

    describe('Behaviour', () => {
      it('should return the sum of the two points', () => {
        let point = new Point2D(0, 0);
        let point1 = new Point2D(3, 4);
        let point2 = new Point2D(1, 2);
        let point3 = new Point2D(-1, 2);
        let point4 = new Point2D(-1, -2);

        point.add(point1).equals(new Point2D(3, 4)).should.be.true();
        point2.add(point1).equals(new Point2D(4, 6)).should.be.true();
        point1.add(point2).equals(new Point2D(4, 6)).should.be.true();
        point3.add(point4).equals(new Point2D(-2, 0)).should.be.true();
      });
    });
  });

  describe('subtract()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        point.subtract.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => point.subtract()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('subtract', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => point.subtract(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('subtract', 1));
        expect(() => point.subtract(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('subtract', false));
        expect(() => point.subtract('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('subtract', 's'));
        expect(() => point.subtract({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('subtract', { '4': 4 }));
      });
    });

    describe('Behaviour', () => {
      it('should return the sum of the two points', () => {
        let point = new Point2D(0, 0);
        let point1 = new Point2D(3, 4);
        let point2 = new Point2D(1, 2);
        let point3 = new Point2D(-1, 2);
        let point4 = new Point2D(-1, -2);

        point.subtract(point1).equals(new Point2D(-3, -4)).should.be.true();
        point2.subtract(point1).equals(new Point2D(-2, -2)).should.be.true();
        point1.subtract(point2).equals(new Point2D(2, 2)).should.be.true();
        point3.subtract(point4).equals(new Point2D(0, 4)).should.be.true();
      });
    });
  });

  describe('dotProduct()', () => {
    describe('API', () => {
      it('should expect 1 mandatory argument', () => {
        point.dotProduct.length.should.eql(1);
      });

      it('should throw if no argument is passed', () => {
        expect(() => point.dotProduct()).to.throw(ERROR_MSG_PARAM_INVALID_POINT('dotProduct', undefined));
      });

      it('should throw if the argument is not a valid point', () => {
        expect(() => point.dotProduct(1)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('dotProduct', 1));
        expect(() => point.dotProduct(false)).to.throw(ERROR_MSG_PARAM_INVALID_POINT('dotProduct', false));
        expect(() => point.dotProduct('s')).to.throw(ERROR_MSG_PARAM_INVALID_POINT('dotProduct', 's'));
        expect(() => point.dotProduct({ '4': 4 })).to.throw(ERROR_MSG_PARAM_INVALID_POINT('dotProduct', { '4': 4 }));
      });
    });

    describe('Behaviour', () => {
      it('should return the sum of the two points', () => {
        let point = new Point2D(0, 0);
        let point1 = new Point2D(3, 4);
        let point2 = new Point2D(1, 2);
        let point3 = new Point2D(-1, 2);
        let point4 = new Point2D(-1, -2);

        point.dotProduct(point1).should.eql(0);
        point2.dotProduct(point1).should.eql(11);
        point1.dotProduct(point2).should.eql(11);
        point3.dotProduct(point4).should.eql(-3);
      });
    });
  });
});