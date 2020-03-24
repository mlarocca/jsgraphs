import UnionFind from '../disjointset/disjointset.js';
import DWayHeap from '../dway_heap/dway_heap.js';

import Edge from './edge.js';
import Vertex from './vertex.js';
import { isDefined, isUndefined } from '../common/basic.js';

import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_DUPLICATED, ERROR_MSG_VERTEX_NOT_FOUND } from '../common/errors.js';
import { consistentStringify } from '../common/strings.js';
import { isNumber, range } from '../common/numbers.js';

const _vertices = new WeakMap();

class GVertex extends Vertex {
  /**
   * @private
   */
  #adjacencyMap;

  /**
   * @constructor
   * @for GVertex
   *
   * Construct an object representation for a graph's vertex.
   *
   * @param {*} label  The vertex's label.
   * @param {number?} weight  The weight associated to the vertex (by default, 1).
   * @param {array<Edge>?} outgoingEdges  An optional array of outgoing edges from this vertices.
   * @return {GVertex}  The Vertex created.
   * @throws {TypeError} if the arguments are not valid, i.e. label is not defined, weight is not
   *                     (parseable to) a number, or outgoingEdges is not a valid array of Edges.
   */
  constructor(label, { weight, outgoingEdges = [] } = {}) {
    super(label, { weight: weight });
    if (!Array.isArray(outgoingEdges)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex constructor', 'outgoingEdges', outgoingEdges));
    }

    this.#adjacencyMap = new Map();

    outgoingEdges.forEach(edge => {
      if (!(edge instanceof Edge) || !this.labelEquals(edge.source)) {
        throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex constructor', 'outgoingEdges', outgoingEdges));
      }

      this.addEdge(edge);
    });
  }

  /**
   * For a multigraph, returns all the edges starting at this vertex.
   * For a simple graph, returns only the last outgoing edge added between this vertex and each other vertex.
   * @returns {Array}
   */
  *outgoingEdges() {
    for (let edgesArray of this.#adjacencyMap.values()) {
      let n = edgesArray.length;
      if (n > 0) {
        yield edgesArray[n - 1];
      }
    }
  }

  outDegree() {
    let n = 0;
    for (let edgesArray of this.#adjacencyMap.values()) {
      if (edgesArray.length > 0) {
        ++n;
      }
    }
    return n;
  }

  /**
   *
   * @param {GVertex} v
   * @returns {undefined}
   */
  edgeTo(v) {
    if (!(v instanceof GVertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.edgeTo', 'v', v));
    }

    let edges = this.#adjacencyMap.has(v.id) ? this.#adjacencyMap.get(v.id) : [];
    let n = edges.length;
    return n > 0 ? edges[n - 1] : undefined;
  }

  addEdge(edge) {
    if ((!(edge instanceof Edge)) || !this.labelEquals(edge.source.label)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.addEdge', 'edge', edge));
    }
    return replaceEdgeTo(this.#adjacencyMap, edge.destination, edge);
  }

  addEdgeTo(v, { edgeWeight, edgeLabel } = {}) {
    if (!(v instanceof GVertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.addEdgeTo', 'v', v));
    }
    let edge = new Edge(this, v, { weight: edgeWeight, label: edgeLabel });
    this.addEdge(edge);
    return edge;
  }

  removeEdge(edge) {
    if (!(edge instanceof Edge) || !this.labelEquals(edge.source.label)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.removeEdge', 'edge', edge));
    }
    return replaceEdgeTo(this.#adjacencyMap, edge.destination);
  }

  removeEdgeTo(v) {
    if (!(v instanceof GVertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.removeEdgeTo', 'v', v));
    }
    return replaceEdgeTo(this.#adjacencyMap, v);
  }

  /**
   * @override
   */
  clone() {
    return new GVertex(this.label, { weight: this.weight });
  }

  /**
   * @override
   */
  toString() {
    return `GVertex: ${this.toJson()}`;
  }
}

/**
 * @method replaceEdgeTo
 * @for GVertex
 * @private
 *
 * @param adj
 * @param {Vertex} destination
 * @param {*?} label
 * @param {Edge} newEdge  The edge with whom the old one needs to be replaced. If null or undefined, it will
 *                        remove the old edge.
 */
function replaceEdgeTo(adj, destination, newEdge = null) {
  let edgesToDest = adj.has(destination) ? adj.get(destination) : [];

  // removes all the edges to the destination
  edgesToDest = [];

  // then add the new edge (if defined)
  if (isDefined(newEdge)) {
    edgesToDest.push(newEdge);
  }

  adj.set(destination.id, edgesToDest);
}

/** @class Graph
 *
 * This module exports two classes to create instances of graphs objects.
 * It is possible to create both directed graphs (default Graph)
 * and undirected graphs (via the UndirectedGraph class).
 * Hypergraphs are not available yet, so for both directed and undirected graphs,
 * parallel edges are forbidden, although loops are not.
 * After creating each graph instance, a number of algorithms can be run on it:
 *   - DFS (ToDo)
 *   - BFS (ToDo)
 *   - Kruskal and Prim's algorithms (on undirected graphs) (ToDo)
 *   - Connected components computation (ToDo)
 *   - Strongly connected components computation (directed graphs) (ToDo)
 *   - Dijkstra's (ToDo)
 *   - Bellman-Ford's (ToDo)
 *   - Floyd-Warshall's (ToDo)
 *   - ...
 */
class Graph {

  /**
   * @method fromJson
   * @for Graph.class
   *
   * Takes a string with the JSON encoding of a graph, and creates a new Graph object based on it.
   *
   * @param {*} json The string with the graph's JSON encoding, as outputed by Graph.toJson.
   */
  static fromJson(json) {
    return Graph.fromJsonObject(JSON.parse(json));
  }

  /**
   * @method fromJsonObject
   * @for Graph.class
   *
   * Takes a plain object with fields for a graph's vertices and edges, each encoded as a JSON string, and
   * created a new Graph matching the JSON provided.
   * The argument for this method is, ideally, the output of JSON.parse(g.toJson()), where g is an instance of Graph.
   *
   * @param {Array} vertices An array with the JSON for the vertices to be
   */
  static fromJsonObject({ vertices, edges }) {
    let g = new Graph();
    vertices.forEach(v => g.addVertex(GVertex.fromJsonObject(v)));
    edges.forEach(e => g.addEdge(Edge.fromJsonObject(e)));
    return g;
  }

  constructor() {
    _vertices.set(this, new Map());
  }

  /**
   *
   */
  get vertices() {
    return [...getVertices(this)].map(v => v.clone());
  }

  get edges() {
    return [...getEdges(this)].map(e => e.clone());
  }

  /**
   * @name isDirected
   * @for Graph
   * @description
   * States if the graph is a directed graph (true) or an undirected one.
   * @return {boolean}
   */
  isDirected() {
    return true;
  }

  createVertex(label, { weight } = {}) {
    let vcs = _vertices.get(this);

    if (this.hasVertex(label)) {
      throw new Error(ERROR_MSG_VERTEX_DUPLICATED('Graph.createVertex', label));
    }

    let v = new GVertex(label, { weight: weight });

    vcs.set(v.id, v);
    _vertices.set(this, vcs);

    return v;
  }

  addVertex(vertex) {
    if (!(vertex instanceof Vertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.addVertex', vertex));
    }
    let vcs = _vertices.get(this);

    if (this.hasVertex(vertex.label)) {
      throw new Error(ERROR_MSG_VERTEX_DUPLICATED('Graph.addVertex', vertex));
    }

    const v = new GVertex(vertex.label, { weight: vertex.weight });
    vcs.set(vertex.id, v);
    _vertices.set(this, vcs);

    return v;
  }

  hasVertex(vertex) {
    let v = getGraphVertex(this, vertex);
    return isDefined(v) && (v instanceof GVertex);
  }

  getVertex(vertex) {
    let v = getGraphVertex(this, vertex);
    return isDefined(v) ? v.clone() : undefined;
  }

  getVertexWeight(vertex) {
    let v = getGraphVertex(this, vertex);
    return isDefined(v) ? v.weight : undefined;
  }

  /**
   * For a regular graph, returns the size of the adjacency vector for this vertex (as to each destination,
   * at most one edge is allowed).
   * @returns {*}
   */
  getVertexOutDegree(vertex) {
    let v = getGraphVertex(this, vertex);
    return isDefined(v) ? vertex.outDegree() : undefined;
  }

  createEdge(source, destination, { weight, label } = {}) {
    if (!this.hasVertex(source)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', source));
    }
    if (!this.hasVertex(destination)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', destination));
    }

    let u = getGraphVertex(this, source);
    let v = getGraphVertex(this, destination);
    return u.addEdgeTo(v, { edgeWeight: weight, edgeLabel: label });
  }

  addEdge(edge) {
    if (!(edge instanceof Edge)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.addEdge', edge));
    }

    if (!this.hasVertex(edge.source)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.addEdge', edge.source));
    }
    if (!this.hasVertex(edge.destination)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.addEdge', edge.destination));
    }

    let u = getGraphVertex(this, edge.source);
    let v = getGraphVertex(this, edge.destination);
    return u.addEdgeTo(v, { edgeWeight: edge.weight, edgeLabel: edge.label });
  }

  hasEdge(edge) {
    if (!edge instanceof Edge) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.hasEdge', edge));
    }
    let es = this.edges;
    return es.some(e => e.equals(edge));
  }

  hasEdgeBetween(source, destination) {
    let e = getGraphEdge(this, source, destination);
    return isDefined(e) && (e instanceof Edge);
  }

  getEdge(source, destination) {
    let e = getGraphEdge(this, source, destination);
    return isDefined(e) ? e.clone() : undefined;
  }

  getEdgeWeight(sourceLabel, destinationLabel) {
    let e = getGraphEdge(this, sourceLabel, destinationLabel);
    return isDefined(e) ? e.weight : undefined;
  }

  getEdgeLabel(sourceLabel, destinationLabel) {
    let e = getGraphEdge(this, sourceLabel, destinationLabel);
    return isDefined(e) ? e.label : undefined;
  }

  clone() {
    let g = new Graph();
    for (let v of getVertices(this)) {
      g.addVertex(v.clone());
    }
    for (let e of getEdges(this)) {
      g.addEdge(e.clone());
    }
    return g;
  }

  toJson() {
    return consistentStringify(this.toJsonObject());
  }

  toJsonObject() {
    return {
      vertices: [...getVertices(this)].map(v => v.toJsonObject()),
      edges: [...getEdges(this)].map(e => e.toJsonObject())
    };
  }

  equals(g) {
    return (g instanceof Graph) && this.toJson() === g.toJson();
  }
}


export class UndirectedGraph extends Graph {
  static completeGraph(n) {
    if (!isNumber(n) || n < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.completeGraph', 'n', n));
    }

    let g = new UndirectedGraph();
    const r = range(1, n + 1);
    r.forEach(i => g.createVertex(i));
    r.forEach(i => range(i + 1, n + 1).forEach(j => {
      g.createEdge(i, j);
    }));

    return g;
  }

  static completeBipartiteGraph(n, m) {
    if (!isNumber(n) || n < 1) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.completeBipartiteGraph', 'n', n));
    }

    if (!isNumber(m) || m < 1) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.completeBipartiteGraph', 'm', m));
    }

    let g = new UndirectedGraph();
    const r1 = range(1, n + 1);
    const r2 = range(n + 1, n + m + 1);
    r1.forEach(i => g.createVertex(i));
    r2.forEach(j => g.createVertex(j));

    r1.forEach(i => r2.forEach(j => {
      g.createEdge(i, j);
    }));

    return g;
  }

  /**
   * @override
   */
  isDirected() {
    return false;
  }

  /**
   * @override
   * @param {*} source
   * @param {*} destination
   * @param {*} param2
   */
  createEdge(source, destination, { weight, label } = {}) {
    let e = super.createEdge(source, destination, { weight: weight, label: label });

    // Add an each for each direction, unless it's a loop
    if (!e.isLoop()) {
      super.createEdge(destination, source, { weight: weight, label: label });
    }
    return e;
  }

  /**
   * @override
   * @param {*} edge
   */
  addEdge(edge) {
    if (!(edge instanceof Edge)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.addEdge', edge));
    }

    if (!this.hasVertex(edge.source)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.addEdge', edge.source));
    }
    if (!this.hasVertex(edge.destination)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.addEdge', edge.destination));
    }

    let u = getGraphVertex(this, edge.source);
    let v = getGraphVertex(this, edge.destination);
    let e = u.addEdgeTo(v, { edgeWeight: edge.weight, edgeLabel: edge.label });
    if (!e.isLoop()) {
      v.addEdgeTo(u, { edgeWeight: edge.weight, edgeLabel: edge.label });
    }
    return e;
  }

  clone() {
    let g = new UndirectedGraph();
    for (let v of getVertices(this)) {
      g.addVertex(v.clone());
    }
    for (let e of getEdges(this)) {
      g.addEdge(e.clone());
    }
    return g;
  }
}

/**
 * @method getGraphVertex
 * @for Graph
 * @private
 *
 * Utility method to extract a vertex from a graph.
 * This method should not be exposed because clients shouldn't be able to directly manipulate vertices.
 *
 * @param {Graph} graph
 * @param {GVertex|any} vertex
 */
function getGraphVertex(graph, vertex) {
  let label;
  if (vertex instanceof Vertex) {
    label = vertex.id;
  } else {
    label = Vertex.serializeLabel(vertex);
  }

  let vcs = _vertices.get(graph);
  return vcs.get(label);
}

/**
 *
 * @private
 *
 * @param {*} graph
 * @param {*} source
 * @param {*} destination
 */
function getGraphEdge(graph, source, destination) {
  let u = getGraphVertex(graph, source);
  if (isUndefined(u)) {
    return undefined;
  }

  let v = getGraphVertex(graph, destination);
  if (isUndefined(v)) {
    return undefined;
  }
  return u.edgeTo(v);
}

/**
 * @private
 *
 * @param {*} graph
 *
 */
function* getVertices(graph) {
  yield* _vertices.get(graph).values();
}

/**
 * @private
 *
 * @param {*} graph
 */
function* getEdges(graph) {
  for (let v of getVertices(graph)) {
    yield* v.outgoingEdges();
  }
}


export default Graph;