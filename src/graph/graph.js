import UnionFind from '../disjointset/disjointset.js';
import DWayHeap from '../dway_heap/dway_heap.js';
import Point from '../geometric/point.js';

import Edge from './edge.js';
import Vertex from './vertex.js';
import { isDefined, isUndefined } from '../common/basic.js';
import { consistentStringify } from '../common/strings.js';

import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_DUPLICATED, ERROR_MSG_VERTEX_NOT_FOUND } from '../common/errors.js';

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
    super(label, {weight: weight});
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
  get outgoingEdges() {
    let outEdges = [];
    for (let [key, edgesArray] of this.#adjacencyMap) {
      let n = edgesArray.length;
      if (n > 0) {
        outEdges.push(edgesArray[n - 1]);
      }
    }
    return outEdges;
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
    let edges = this.#adjacencyMap.has(v.label) ? this.#adjacencyMap.get(v.label) : [];
    let n = edges.length;
    return n > 0 ? edges[n - 1] : undefined;
  }

  addEdge(edge) {
    if ((!(edge instanceof Edge)) || !this.labelEquals(edge.source)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.addEdge', 'edge', edge));
    }
    return replaceEdgeFromTo(this.#adjacencyMap, edge.destination, edge.label, edge);
  }

  addEdgeTo(v, { edgeWeight, edgeLabel } = {}) {
    if (!(v instanceof GVertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.addEdgeTo', 'v', v));
    }
    let edge = new Edge(this.label, v.label, { weight: edgeWeight, label: edgeLabel });
    this.addEdge(edge);
    return edge;
  }

  removeEdge(edge) {
    if (!(edge instanceof Edge) || !this.labelEquals(edge.source)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.removeEdge', 'edge', edge));
    }
    return replaceEdgeFromTo(this.#adjacencyMap, edge.destination, edge.label);
  }

  removeEdgeTo(v, { edgeLabel } = {}) {
    if (!(v instanceof GVertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.removeEdgeTo', 'v', v));
    }
    return replaceEdgeFromTo(this.#adjacencyMap, v.label, edgeLabel);
  }
}

/**
 * @method replaceEdgeFromTo
 * @for GVertex
 * @private
 *
 * @param adj
 * @param destination
 * @param {*?} label
 * @param {Edge} newEdge  The edge with whom the old one needs to be replaced. If null or undefined, it will
 *                        remove the old edge.
 */
function replaceEdgeFromTo(adj, destination, label, newEdge = null) {
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
    vertices.forEach(v => g.addVertex(GVertex.fromJson(v)));
    edges.forEach(e => g.addEdge(Edge.fromJson(e)));
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

  createVertex(label, { weight } = {}) {
    let vcs = _vertices.get(this);

    if (this.hasVertex(label)) {
      throw new Error(ERROR_MSG_VERTEX_DUPLICATED('Graph.createVertex', label));
    }

    let v = new GVertex(label, { weight: weight });

    vcs.set(consistentStringify(v.label), v);
    _vertices.set(this, vcs);
  }

  addVertex(v) {
    if (!(v instanceof Vertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.addVertex', v));
    }
    let vcs = _vertices.get(this);

    if (this.hasVertex(v.label)) {
      throw new Error(ERROR_MSG_VERTEX_DUPLICATED('Graph.addVertex', v));
    }

    vcs.set(consistentStringify(v.label), new GVertex(v.label, {weight: v.weight}));
    _vertices.set(this, vcs);
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
    return isDefined(v) ? vertex.outgoingEdges.size : undefined;
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

  toJson() {
    return JSON.stringify({
      vertices: [...getVertices(this)].map(v => v.toJson()),
      edges: [...getEdges(this)].map(e => e.toJson())
    });
  }

  equals(g) {
    return (g instanceof Graph) && this.toJson() === g.toJson();
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
    label = vertex.label;
  } else {
    label = vertex;
  }

  let vcs = _vertices.get(graph);
  return vcs.get(consistentStringify(label));
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
    for (let e of v.outgoingEdges) {
      yield e;
    }
  }
}

export class UndirectedGraph extends Graph {

}

export default Graph;