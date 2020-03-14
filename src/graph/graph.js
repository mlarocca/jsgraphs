import UnionFind from '../disjointset/disjointset.js';
import DWayHeap from '../dway_heap/dway_heap.js';
import Edge from './edge.js';
import Vertex from './vertex.js';
import { isDefined, isUndefined } from '../common/basic.js';
import { consistentStringify } from '../common/strings.js';

import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_DUPLICATED, ERROR_MSG_VERTEX_NOT_FOUND } from '../common/errors.js';

const _vertices = new WeakMap();

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
    vertices.forEach(v => g.addVertex(Vertex.fromJson(v)));
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
    return Array.from(_vertices.get(this).values());
  }

  get edges() {
    return this.vertices.flatMap(v => v.outgoingEdges);
  }

  get size() {
    return _size.get(this);
  }

  createVertex(label, { size } = {}) {
    let vcs = _vertices.get(this);

    if (this.hasVertex(label)) {
      throw new Error(ERROR_MSG_VERTEX_DUPLICATED('Graph.createVertex', label));
    }

    let v = new Vertex(label, { size: size });

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

    vcs.set(consistentStringify(v.label), v);
    _vertices.set(this, vcs);
  }

  hasVertex(v) {
    let label;
    if (v instanceof Vertex) {
      label = v.label;
    } else {
      label = v;
    }

    return _vertices.get(this).has(consistentStringify(label));
  }

  getVertexSize(vertex) { 
    let v = getGraphVertex(this, vertex);
    return isDefined(v) ? v.size : undefined;
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

  getEdgeWeight(sourceLabel, destinationLabel) {
    let e = getGraphEdge(this, sourceLabel, destinationLabel);
    return isDefined(e) ? e.weight : undefined;
  }

  getEdgeLabel(sourceLabel, destinationLabel) {
    let e = getGraphEdge(this, sourceLabel, destinationLabel);
    return isDefined(e) ? e.label : undefined;
  }

  hasEdgeBetween(sourceLabel, destinationLabel) {
    if (!(this.hasVertex(sourceLabel) && this.hasVertex(destinationLabel))) {
      return false;
    }
    return isDefined(getGraphVertex(this, sourceLabel).edgeTo(getGraphVertex(this, destinationLabel)));
  }

  toJson() {
    return JSON.stringify({
      vertices: this.vertices.map(v => v.toJson()),
      edges: this.edges.map(e => e.toJson())
    });
  }

  equals(g) {
    return (g instanceof Graph) && this.toJson() === g.toJson();
  }
}

/**
 * @method getVertexFromGraph
 * @for Graph
 * @private
 * 
 * Utility method to extract a vertex from a graph.
 * This method should not be exposed because clients shouldn't be able to directly manipulate vertices.
 * 
 * @param {Graph} graph 
 * @param {Vertex|any} vertex 
 */
function getGraphVertex(graph, vertex) {
  let label;
  if (vertex instanceof Vertex) {
    label = vertex.label;
  } else {
    label = vertex;
  }

  let v = _vertices.get(graph);
  return isDefined(v) ? v.get(consistentStringify(label)) : undefined;
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
 */
function allGraphVertices(graph) {

}


/**
 * @private
 * 
 * @param {*} graph 
 */
function allGraphEdges(graph) {

}



export class UndirectedGraph extends Graph {

}

export class GraphEmbedding {
  #graph;
  #coordinates;

  constructor(graph, coordinates) {
    this.#graph = graph;
    this.#coordinates = coordinates;
  }

  getVertexCoordinates(vertex) {
    if (!this.#graph.hasVertex(vertex)) {
      throw new ERROR_MSG_VERTEX_NOT_FOUND('GraphEmbedding.getVertexCoordinates()', vertex);
    }
    return this.#coordinates.get(vertex);
  }
}

export default Graph;