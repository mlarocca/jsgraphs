import Edge from './edge.js';
import { isDefined } from '../common/basic.js';
import { isNumber, toNumber } from '../common/numbers.js';
import { consistentStringify } from '../common/strings.js';
import { ERROR_MSG_INVALID_ARGUMENT } from '../common/errors.js';

const DEFAULT_VERTEX_WEIGHT = 1;

const EDGE_WEIGHT_FUNC = (edge) => edge.weight;

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
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'label', label));
    }
    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'weight', weight));
    }

    this.#label = label;
    this.#weight = toNumber(weight);
  }

  get label() {
    return this.#label;
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
   * @param {*} shallow When true, label is copied by reference, not cloned. 
   */
  clone(shallow = false) {
    if (shallow) {
      return new Vertex(this.label, { weight: this.weight });
    } else {
      return new Vertex(JSON.parse(JSON.stringify(this.label)), { weight: this.weight });
    }
  }
}


export default Vertex;