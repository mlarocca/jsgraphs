import Point from './point.js';
import { randomDouble } from '../common/numbers.js';

/**
 * @class Point2D
 * @description
 * Models a 2D Point in the Cartesian plane.
 */
class Point2D extends Point {

  /**
   * @static
   * @param {string} json
   */
  static fromJson(json) {
    return new Point2D(...JSON.parse(json));
  }

  /**
   * @constructor
   * @for Point2D
   * @description
   * Build a 2D Point from x and y coordinates.
   * If coordinates are not numbers, throws a TypeError.
   *
   * @param {number} x The x coordinate.
   * @param {number} y The y coordinate.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if either coordinate isn't valid.
   */
  constructor(x, y) {
    super(x, y);
  }

  /**
   * @name validatePoint
   * @for Point2D
   * @description
   * Validates a point (2D), and throws an error if the validation fails.
   *
   * @param {Point2D} maybePoint The point to validate.
   * @param {?string} fname The name of the caller function, for logging purposes.
   * @throws TypeError(ERROR_MSG_PARAM_INVALID_POINT) if the argument is not a valid point.
   * @throws TypeError(ERROR_MSG_PARAM_TYPE) if the coordinates aren't valid.
   */
  static validatePoint(maybePoint, fname = 'validatePoint') {
    super.validatePoint(maybePoint, 2, fname);
  }

  /**
   * @name random
   * @static
   * @for Point2D
   * @description
   * Create a random Point2D.
   * The values for the coordinates are independent random numbers between 0 and Number.MAX_SAFE_INTEGER,
   * unless a width and height are passed (therefore limiting the max values accordingly).
   *
   * @param {Number} width The width of the canvas where the point should lie.
   * @param {Number} height The point to validate.
   * @return {Point} A new random 2D point.
   */
  static random({width, height} = {}) {
    return new Point2D(randomDouble(0, width), randomDouble(0, height));
  }

  /**
   * @name x
   * @for Point2D
   * @description
   * Getter for the x coordinate.
   *
   * @returns {number} The value of the x coordinate for the point.
   */
  get x() {
    return this.coordinates()[0];
  }

  /**
   * @name y
   * @for Point2D
   * @description
   * Getter for the y coordinate.
   *
   * @returns {number} The value of the y coordinate for the point.
   */
  get y() {
    return this.coordinates()[1];
  }


  /**
   * @name clone
   * @for Point
   * @override
   * @description
   * Clones current point.
   * @returns {Point2D} A new point with the same coordinates as this.
   */
  clone() {
    return new Point2D(this.x, this.y);
  }
}

export default Point2D;