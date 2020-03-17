import Edge from './edge.js';
import { isDefined } from '../common/basic.js';
import { isNumber, toNumber } from '../common/numbers.js';
import { consistentStringify } from '../common/strings.js';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_LABEL } from '../common/errors.js';

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

  /**
   * @private
   */
  #adjacencyMap;

  static isSerializable(label) {
    return JSON.parse(consistentStringify(label)) !== null;
  }

  static serializeLabel(label) {
    return consistentStringify(label);
  }

  static fromJson(json) {
    return Vertex.fromJsonObject(JSON.parse(json));
  }

  static fromJsonObject({ label, weight = DEFAULT_VERTEX_WEIGHT, outgoingEdges = [] }) {
    return new Vertex(label, { weight: weight, outgoingEdges: outgoingEdges.map(Edge.fromJsonObject) });
  }

  /**
   * @constructor
   * @for Vertex
   *
   * Construct an object representation for a graph's vertex.
   *
   * @param {*} label  The vertex's label.
   * @param {number?} weight  The weight associated to the vertex (by default, 1).
   * @param {array<Edge>?} outgoingEdges  An optional array of outgoing edges from this vertices.
   * @return {Vertex}  The Vertex created.
   * @throws {TypeError} if the arguments are not valid, i.e. label is not defined, or weight is not
   *                     (parseable to) a number.
   */
  constructor(label, { weight = DEFAULT_VERTEX_WEIGHT, outgoingEdges = [] } = {}) {
    if (!isDefined(label)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex()', 'label', label));
    }
    if (!Vertex.isSerializable(label)) {
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
    return this.#label;
  }

  get serializedLabel() {
    return Vertex.serializeLabel(this.label);
  }

  get weight() {
    return this.#weight;
  }

  toJson() {
    return consistentStringify({
      label: this.label,
      weight: this.weight
    });
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