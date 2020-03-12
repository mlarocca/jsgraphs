import Edge from './edge.js';
import {isDefined} from '../common/basic.js';
import {isNumber, toNumber} from '../common/numbers.js';
import {consistentStringify} from '../common/strings.js';
import {ERROR_MSG_INVALID_ARGUMENT} from '../common/errors.js';

const DEFAULT_VERTEX_SIZE = 1;
const _label = new WeakMap();
const _size = new WeakMap();
const _adjacencyMap = new WeakMap();

const EDGE_WEIGHT_FUNC = (edge) => edge.weight;

/**
 *
 */
class Vertex {
  static fromJson(json) {
    return Vertex.fromJsonObject(JSON.parse(json));
  }

  static fromJsonObject({label, size = DEFAULT_VERTEX_SIZE, outgoingEdges = [] }) {
    return new Vertex(label, {size: size, outgoingEdges: outgoingEdges.map(Edge.fromJsonObject)});
  }
  
  /**
   * @constructor
   * @for Vertex
   *
   * Construct an object representation for a graph's vertex.
   *
   * @param {*} label  The vertex's label.
   * @param {number?} size  The size associated to the vertex (by default, 1).
   * @param {array<Edge>?} outgoingEdges  An optional array of outgoing edges from this vertices.
   * @return {Vertex}  The Vertex created.
   * @throws {TypeError} if the arguments are not valid, i.e. label is not defined, size is not
   *                     (parseable to) a number, or outgoingEdges is not a valid array of Edges.
   */
  constructor(label, { size=DEFAULT_VERTEX_SIZE, outgoingEdges=[] } = {}) {
    if (!isDefined(label)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'label', label));
    }
    if (!isNumber(size)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'size', size));
    } if (!Array.isArray(outgoingEdges)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', outgoingEdges));
    }

    _label.set(this, label);
    _size.set(this, toNumber(size));

    _adjacencyMap.set(this, new Map());

    outgoingEdges.forEach(edge => {
      if (!(edge instanceof Edge) || !this.labelEquals(edge.source)) {
        throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', outgoingEdges));
      }

      this.addEdge(edge);
    });
  }

  get label() {
    return _label.get(this);
  }

  get size() {
    return _size.get(this);
  }

  /**
   * For a regular graph, returns the size of the adjacency vector for this vertex (as to each destination,
   * at most one edge is allowed). For a multigraph, it sums over the total number of edges for each destination.
   * @returns {*}
   */
  get outDegree() {
    let adj = _adjacencyMap.get(this);
    return adj.size;
  }

  /**
   * For a multigraph, returns all the edges starting at this vertex.
   * For a simple graph, returns only the last outgoing edge added between this vertex and each other vertex.
   * @returns {Array}
   */
  get outgoingEdges() {
    let outEdges = [];
    for (let [key, edgesArray] of _adjacencyMap.get(this)) {
      let n = edgesArray.length;
      if (n > 0) {
        outEdges.push(edgesArray[n - 1]);
      }
    }
    return outEdges;
  }

  /**
   *
   * @param {Vertex} v
   * @returns {undefined}
   */
  edgeTo(v) {
    if (!(v instanceof Vertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex.edgeTo', 'v', v));
    }
    let adj = _adjacencyMap.get(this);
    let edges =  adj.has(v.label) ? adj.get(v.label) : [];
    let n = edges.length;
    return n > 0 ? edges[n-1] : undefined;
  }

  addEdge(edge) {
    if ((!(edge instanceof Edge)) || !this.labelEquals(edge.source)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex.addEdge', 'edge', edge));
    }
    return replaceEdgeFromTo(this, edge.destination, edge.label, edge);
  }

  addEdgeTo(v, {edgeWeight, edgeLabel} = {}) {
    if (!(v instanceof Vertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex.addEdgeTo', 'v', v));
    }
    let edge = new Edge(this.label, v.label, {weight: edgeWeight, label: edgeLabel});
    this.addEdge(edge);
    return edge;
  }

  removeEdge(edge) {
    if (!(edge instanceof Edge) || !this.labelEquals(edge.source)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex.removeEdge', 'edge', edge));
    }
    return replaceEdgeFromTo(this, edge.destination, edge.label);
  }

  removeEdgeTo(v, {edgeLabel} = {}) {
    if (!(v instanceof Vertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex.removeEdgeTo', 'v', v));
    }
    return replaceEdgeFromTo(this, v.label, edgeLabel);
  }

  toJson() {
    return consistentStringify({
      label: this.label,
      size: this.size
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
    return consistentStringify(label) === consistentStringify(_label.get(this));
  }
}


/**
 * @method replaceEdgeFromTo
 * @for Vertex
 * @private
 *
 * @param vertex
 * @param destination
 * @param {*?} label
 * @param {Edge} newEdge  The edge with whom the old one needs to be replaced. If null or undefined, it will
 *                        remove the old edge.
 */
function replaceEdgeFromTo(vertex, destination, label, newEdge=null) {
  let adj = _adjacencyMap.get(vertex);
  let edgesToDest = adj.has(destination) ? adj.get(destination) : [];

  if (label !== null) {
    // remove edge(s) with the same label
    edgesToDest = edgesToDest.filter(e => !e.labelEquals(label));
  } else {
    // if no label is passed, removes all the edges to the destination
    edgesToDest = [];
  }

  // then add the new edge (if defined)
  if (isDefined(newEdge)) {
    edgesToDest.push(newEdge);
  }

  adj.set(destination, edgesToDest);
}

export default Vertex;