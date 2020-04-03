import { isDefined } from '../common/basic.mjs';
import { isNumber, toNumber } from '../common/numbers.mjs';
import { consistentStringify, isJsonStringifiable } from '../common/strings.mjs';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_LABEL } from '../common/errors.mjs';

import rfdc from 'rfdc';

const DEFAULT_VERTEX_WEIGHT = 1;

const deepClone = rfdc({ proto: true, circles: false });

/**
 *
 */
class Vertex {
  /**
   * @private
   */
  #label;

  /**
   * @private
   */
  #weight;

  static isValidLabel(label) {
    return isJsonStringifiable(label);
  }

  static idFromLabel(label) {
    return consistentStringify(label);
  }

  static fromJson(json) {
    return Vertex.fromJsonObject(JSON.parse(json));
  }

  static fromJsonObject({ label, weight = DEFAULT_VERTEX_WEIGHT }) {
    return new Vertex(label, { weight: weight });
  }

  /**
   * @constructor
   * @for Vertex
   *
   * Construct an object representation for a graph's vertex.
   *
   * @param {*} label  The vertex's label.
   * @param {number?} weight  The weight associated to the vertex (by default, 1).
   * @return {Vertex}  The Vertex created.
   * @throws {TypeError} if the arguments are not valid, i.e. label is not defined, or weight is not
   *                     (parseable to) a number.
   */
  constructor(label, { weight = DEFAULT_VERTEX_WEIGHT } = {}) {
    if (!isDefined(label)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'label', label));
    }
    if (!Vertex.isValidLabel(label)) {
      throw new TypeError(ERROR_MSG_INVALID_LABEL('Vertex()', 'label', label));
    }
    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'weight', weight));
    }

    // Deep clone label
    this.#label = deepClone(label);
    this.#weight = toNumber(weight);
  }

  get label() {
    return deepClone(this.#label);
  }

  get id() {
    return Vertex.idFromLabel(this.label);
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
      label: this.label,
      weight: this.weight
    };
  }

  toString() {
    return `Vertex: ${this.toJson()}`;
  }

  /**
   *
   * @param {Vertex} v
   * @returns {boolean}
   */
  equals(v) {
    return (v instanceof Vertex) && this.toJson() === v.toJson();
  }

  labelEquals(label) {
    return consistentStringify(label) === consistentStringify(this.#label);
  }

  /**
  /**
   * Clones a vertex, copying over the label and weight, NOT the adjacency map.
   *
   */
  clone() {
    return new Vertex(this.label, { weight: this.weight });
  }
}

export default Vertex;