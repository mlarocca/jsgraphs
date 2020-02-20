import {isDefined} from '../common/basic.js';
import {isNumber, toNumber} from '../common/numbers.js';
import {consistentStringify} from '../common/strings.js';
import {ERROR_MSG_INVALID_ARGUMENT} from '../common/errors.js';

const DEFAULT_EDGE_WEIGHT = 1;
const _source = new WeakMap();
const _destination = new WeakMap();
const _weight = new WeakMap();
const _label = new WeakMap();

class Edge {

  static fromJson({source, destination, weight=DEFAULT_EDGE_WEIGHT, label=undefined}) {
    return new Edge(source, destination, {weight: weight, label: label});
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
  constructor(source, destination, { weight=DEFAULT_EDGE_WEIGHT, label} = {}) {
    if (!isDefined(source)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge constructor', 'source', source));
    }
    if (!isDefined(destination)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge constructor', 'destination', destination));
    } if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge constructor', 'weight', weight));
    } if (label === null) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Edge constructor', 'label', label));
    }

    _source.set(this, source);
    _destination.set(this, destination);
    _weight.set(this, toNumber(weight));
    _label.set(this, label);
  }

  get source() {
    return _source.get(this);
  }

  get destination() {
    return _destination.get(this);
  }

  get weight() {
    return _weight.get(this);
  }

  get label() {
    return _label.get(this);
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

  equals(e) {
    return (e instanceof Edge) && this.toJson() === e.toJson();
  }

  labelEquals(label) {
    return consistentStringify(label) === consistentStringify(this.label);
  }
}

export default Edge;