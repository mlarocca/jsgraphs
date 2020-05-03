import { isDefined } from '../common/basic.mjs';
import { isNumber, toNumber } from '../common/numbers.mjs';
import { consistentStringify, isJsonStringifiable } from '../common/strings.mjs';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_LABEL } from '../common/errors.mjs';

import rfdc from 'rfdc';
import escape from 'escape-html';

const DEFAULT_VERTEX_WEIGHT = 1;

const deepClone = rfdc({ proto: true, circles: false });

/**
 *
 */
class Vertex {
  /**
   * @private
   */
  #name;

  /**
   * @private
   */
  #weight;

  static isValidName(name) {
    return isJsonStringifiable(name);
  }

  static idFromName(name) {
    return consistentStringify(name);
  }

  static fromJson(json) {
    return Vertex.fromJsonObject(JSON.parse(json));
  }

  static fromJsonObject({ name, weight = DEFAULT_VERTEX_WEIGHT }) {
    return new Vertex(name, { weight: weight });
  }

  /**
   * @constructor
   * @for Vertex
   *
   * Construct an object representation for a graph's vertex.
   *
   * @param {*} name  The vertex's name.
   * @param {number?} weight  The weight associated to the vertex (by default, 1).
   * @return {Vertex}  The Vertex created.
   * @throws {TypeError} if the arguments are not valid, i.e. name is not defined, or weight is not
   *                     (parseable to) a number.
   */
  constructor(name, { weight = DEFAULT_VERTEX_WEIGHT } = {}) {
    if (!isDefined(name)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'name', name));
    }
    if (!Vertex.isValidName(name)) {
      throw new TypeError(ERROR_MSG_INVALID_LABEL('Vertex()', name));
    }
    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'weight', weight));
    }

    // Deep clone name
    this.#name = deepClone(name);
    this.#weight = toNumber(weight);
  }

  get name() {
    return deepClone(this.#name);
  }

  /**
   * HTML-escaped string for name
   */
  get escapedName() {
    return escape(this.#name.toString());
  }

  /**
   * HTML-escaped string from name
   */
  get escapedLabel() {
    return escape(this.#name.toString());
  }

  get id() {
    return Vertex.idFromName(this.name);
  }

  get weight() {
    return this.#weight;
  }

  set weight(weight) {
    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex.weight=', 'weight', weight));
    }
    return this.#weight = toNumber(weight);
  }

  toJson() {
    return consistentStringify(this.toJsonObject());
  }

  toJsonObject() {
    return {
      name: this.name,
      weight: this.weight
    };
  }

  toString() {
    return `[${this.id}]`;
  }

  /**
   *
   * @param {Vertex} v
   * @returns {boolean}
   */
  equals(v) {
    return (v instanceof Vertex) && this.toJson() === v.toJson();
  }

  /**
  /**
   * Clones a vertex, copying over the name and weight, NOT the adjacency map.
   *
   */
  clone() {
    return new Vertex(this.name, { weight: this.weight });
  }
}

export default Vertex;