import Vertex from './vertex.js'

import { isDefined } from '../common/basic.js';
import { isNumber, toNumber } from '../common/numbers.js';
import { consistentStringify } from '../common/strings.js';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_ILLEGAL_LABEL } from '../common/errors.js';

import rfdc from 'rfdc';

const DEFAULT_EDGE_WEIGHT = 1;
const deepClone = rfdc({ proto: true, circles: false });

class Edge {
  /**
   * @private
   */
  #source;

  /**
   * @private
   */
  #destination;

  /**
   * @private
   */
  #weight;

  /**
   * @private
   */
  #label;

  static fromJson(json) {
    return Edge.fromJsonObject(JSON.parse(json));
  }

  static fromJsonObject({ source, destination, weight = DEFAULT_EDGE_WEIGHT, label = undefined }) {
    return new Edge(source, destination, { weight: weight, label: label });
  }

  /**
   * @constructor
   * @for Edge
   *
   * Construct an object representation for a graph's edge.
   *
   * @param {*} source  The source vertex (edge's startpoint).
   * @param {*} destination  The destination vertex (edge's endpoint).
   * @param {number?}  weight  Edge's weight.
   * @param {*?}  label  Optional Edge's label. Can be any value but null.
   *
   * @return {Edge}  The edge created.
   * @throws {TypeError} if the arguments are not valid, i.e. source or destination are not defined, or weight is not
   *                     (parsable to) a number.
   */
  constructor(source, destination, { weight = DEFAULT_EDGE_WEIGHT, label } = {}) {
    if (!isDefined(source)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'source', source));
    }
    if (!Vertex.isSerializable(source)) {
      throw new TypeError(ERROR_MSG_ILLEGAL_LABEL('Edge()', 'source', source));
    }
    if (!isDefined(destination)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', destination));
    }
    if (!Vertex.isSerializable(destination)) {
      throw new TypeError(ERROR_MSG_ILLEGAL_LABEL('Edge()', 'destination', destination));
    }
    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', weight));
    }
    if (label === null) {
      label = undefined;
    }

    this.#source = deepClone(source);
    this.#destination = deepClone(destination);
    this.#weight = toNumber(weight);
    this.#label = label;
  }

  get source() {
    return this.#source;
  }

  get destination() {
    return this.#destination;
  }

  get weight() {
    return this.#weight;
  }

  get label() {
    return this.#label;
  }

  hasNegativeWeight() {
    return this.weight < 0;
  }

  isLoop() {
    return consistentStringify(this.source) === consistentStringify(this.destination);
  }

  hasLabel() {
    return isDefined(this.label);
  }

  toJson() {
    return consistentStringify({
      source: this.source,
      destination: this.destination,
      weight: this.weight,
      label: this.label
    });
  }

  toString() {
    return `Edge: ${this.toJson()}`;
  }

  equals(e) {
    return (e instanceof Edge) && this.toJson() === e.toJson();
  }

  labelEquals(label) {
    return consistentStringify(label) === consistentStringify(this.label);
  }

  /**
   * 
   * Clones an edge.
   * 
   * @param {*} shallow When true, source's and destination's labels are copied by reference, not cloned. 
   */
  clone(shallow = false) {
    if (shallow) {
      return new Edge(
        this.source,
        this.destination,
        { weight: this.weight, label: this.label });
    } else {
      return new Edge(
        deepClone(this.source),
        deepClone(this.destination),
        { weight: this.weight, label: this.label });
    }
  }
}

export default Edge;