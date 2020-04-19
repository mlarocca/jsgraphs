import Vertex from './vertex.mjs'

import { isDefined } from '../common/basic.mjs';
import { isNumber, toNumber } from '../common/numbers.mjs';
import { consistentStringify, isString } from '../common/strings.mjs';
import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_INVALID_EDGE_LABEL } from '../common/errors.mjs';
import { isNonEmptyString } from '../common/strings.mjs';

import escape from 'escape-html';

const DEFAULT_EDGE_WEIGHT = 1;

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

  static compareEdges(e1, e2) {
    if (e1.source.equals(e2.source)) {
      if (e1.destination.equals(e2.destination)) {
        if (e1.weight === e2.weight) {
          return e1.label < e2.label ? -1 : 1;
        } else {
          return e1.weight < e2.weight ? -1 : 1;
        }
      } else {
        return e1.destination < e2.destination ? -1 : 1;
      }
    } else {
      return e1.source < e2.source ? -1 : 1;
    }
  }

  static fromJson(json) {
    return Edge.fromJsonObject(JSON.parse(json));
  }

  static fromJsonObject({ source, destination, weight = DEFAULT_EDGE_WEIGHT, label = undefined }) {
    return new Edge(Vertex.fromJsonObject(source), Vertex.fromJsonObject(destination), { weight: weight, label: label });
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
   * @param {String?}  label  Optional Edge's label. Can be any value but null.
   *
   * @return {Edge}  The edge created.
   * @throws {TypeError} if the arguments are not valid, i.e. source or destination are not defined, or weight is not
   *                     (parsable to) a number.
   */
  constructor(source, destination, { weight = DEFAULT_EDGE_WEIGHT, label } = {}) {
    if (!(isDefined(source) && (source instanceof Vertex))) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'source', source));
    }

    if (!(isDefined(destination) && (destination instanceof Vertex))) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'destination', destination));
    }

    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge()', 'weight', weight));
    }

    if (label === null) {
      label = undefined;
    }
    if (isDefined(label) && !(isString(label))) {
      throw new TypeError(ERROR_MSG_INVALID_EDGE_LABEL('Edge()', label));
    }

    this.#source = source;
    this.#destination = destination;
    this.#weight = toNumber(weight);
    this.#label = label;
  }

  get id() {
    return `[${this.source.id}][${this.destination.id}]`;
  }

  get source() {
    return this.#source;
  }

  get destination() {
    return this.#destination;
  }

  get label() {
    return this.#label;
  }

  /**
   * HTML-escaped version of label
   */
  get escapedLabel() {
    return isNonEmptyString(this.#label) ? escape(this.#label) : "";
  }

  get weight() {
    return this.#weight;
  }

  set weight(weight) {
    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge.weight=', 'weight', weight));
    }
    this.#weight = toNumber(weight);
  }

  hasNegativeWeight() {
    return this.weight < 0;
  }

  isLoop() {
    return this.source.id === this.destination.id;
  }

  hasLabel() {
    return isDefined(this.label);
  }

  /**
   * @method transpose
   * @for Edge
   *
   * @description
   * Return the transposed edge, i.e. an edge with the same endpoints but in the opposite direction.
   * All other fields remains the same.
   *
   * @return {Edge} The transposed edge.
   */
  transpose() {
    return new Edge(this.#destination, this.#source, {weight: this.#weight, label: this.#label});
  }

  toJson() {
    return consistentStringify(this.toJsonObject());
  }

  toJsonObject() {
    return {
      source: this.source.toJsonObject(),
      destination: this.destination.toJsonObject(),
      weight: this.weight,
      label: this.label
    };
  }

  toString() {
    return `Edge: ${this.toJson()}`;
  }

  equals(e) {
    return (e instanceof Edge) && this.toJson() === e.toJson();
  }

  /**
   *
   * Clones an edge.
   *
   * @param {*} shallow When true, source's and destination's labels are copied by reference, not cloned.
   */
  clone() {
    return new Edge(
      this.source.clone(),
      this.destination.clone(),
      { weight: this.weight, label: this.label });
  }
}

export default Edge;