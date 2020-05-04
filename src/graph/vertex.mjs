import { isDefined } from '../common/basic.mjs';
import { isNumber, toNumber } from '../common/numbers.mjs';
import { consistentStringify, isJsonStringifiable, isString, isNonEmptyString } from '../common/strings.mjs';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_DATA, ERROR_MSG_INVALID_LABEL, ERROR_MSG_INVALID_NAME } from '../common/errors.mjs';

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
   * {*}
   */
  #name;

  /**
   * @private
   * {number}
   */
  #weight;

  /**
   * {string}
   * @private
   */
  #label

  /**
   * {*}
   */
  #data

  static isValidName(name) {
    return isNonEmptyString(name) || isNumber(name);
  }

  static isValidData(data) {
    return isJsonStringifiable(data);
  }

  static isValidLabel(label) {
    return isString(label);
  }

  static idFromName(name) {
    return consistentStringify(name);
  }

  static fromJson(json) {
    return Vertex.fromJsonObject(JSON.parse(json));
  }

  static fromJsonObject({ name, weight = DEFAULT_VERTEX_WEIGHT, label, data }) {
    return new Vertex(name, { weight: weight, label: label, data: data });
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
  constructor(name, { label, data, weight = DEFAULT_VERTEX_WEIGHT } = {}) {
    if (!isDefined(name)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'name', name));
    }
    if (!Vertex.isValidName(name)) {
      throw new TypeError(ERROR_MSG_INVALID_NAME('Vertex()', name));
    }
    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'weight', weight));
    }
    if (isDefined(label) && !Vertex.isValidLabel(label)) {
      throw new TypeError(ERROR_MSG_INVALID_LABEL('Vertex()', label));
    }
    if (isDefined(data) && !Vertex.isValidData(data)) {
      throw new TypeError(ERROR_MSG_INVALID_DATA('Vertex()', data));
    }

    // Deep clone name
    this.#name = name;
    this.#weight = toNumber(weight);
    this.#label = label;
    this.#data = deepClone(data);
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

  get label() {
    return this.#label;
  }

  /**
   * HTML-escaped string from label
   */
  get escapedLabel() {
    return escape(this.#label);
  }

  set label(label) {
    if (isDefined(label) && !Vertex.isValidLabel(label)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex.label=', 'label', label));
    }
    this.#label = label;
  }

  get data() {
    return this.#data;
  }

  set data(data) {
    if (isDefined(data) && !Vertex.isValidData(data)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex.data=', 'data', data));
    }
    this.#data = data;
  }

  hasLabel() {
    return isDefined(this.#label);
  }

  hasData() {
    return isDefined(this.#data);
  }

  toJson() {
    return consistentStringify(this.toJsonObject());
  }

  toJsonObject() {
    let json = {
      name: this.name,
      weight: this.weight
    };
    if (this.hasLabel()) {
      json['label'] = this.#label;
    }
    if (this.hasData()) {
      json['data'] = this.#data;
    }
    return json;
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
    return new Vertex(this.name, { weight: this.weight, data: this.data, label: this.label });
  }
}

export default Vertex;