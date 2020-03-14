import { isDefined } from '../common/basic.js';
import { isNumber, toNumber } from '../common/numbers.js';
import { consistentStringify } from '../common/strings.js';
import { ERROR_MSG_INVALID_ARGUMENT } from '../common/errors.js';

const DEFAULT_EDGE_WEIGHT = 1;

class Edge {
  #source;

  #destination;

  #weight;

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
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge constructor', 'source', source));
    }
    if (!isDefined(destination)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge constructor', 'destination', destination));
    } if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge constructor', 'weight', weight));
    } if (label === null) {
      label = undefined;
    }

    this.#source = source;
    this.#destination = destination;
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
    return `Edge: ${this.toJson}`;
  }

  equals(e) {
    return (e instanceof Edge) && this.toJson() === e.toJson();
  }

  labelEquals(label) {
    return consistentStringify(label) === consistentStringify(this.label);
  }
}

export default Edge;