import UnionFind from '../disjointset/disjointset.js';
import DWayHeap from '../dway_heap/dway_heap.js';
import {consistentStringify} from '../common/strings.js';
import Vertex from './vertex.js';

import {ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_DUPLICATED, ERROR_MSG_VERTEX_NOT_FOUND} from '../common/errors.js';
import Edge from './edge.js';

const _vertices = new Map();

/** @module jsgraphs
 *
 * This module exposes three methods to create instances of graphs objects.
 * It is possible to create both undirected graphs (via UndirectedGraph and Graph constructors)
 * and directed graphs (via the DirectedGraph constructor method).
 * Hypergraphs are not available yet, so for both directed and undirected graphs,
 * parallel edges are forbidden, although self-edges are not.
 * After creating each graph instance, a number of algorithms can be run on it:
 *   - DFS
 *   - BFS
 *   - Kruskal and Prim's algorithms (on undirected graphs)
 *   - Connected components computation
 *   - Strongly connected components computation
 *   - Dijkstra's
 *   - Bellman-Ford's
 *   - Floyd-Warshall's
 *   - ...
 */
class Graph {

  static fromJson({vertices, edges}) {
    let g = new Graph();
    vertices.forEach(v => g.addVertex(Vertex.fromJson(JSON.parse(v))));
    edges.forEach(e => g.addEdge(Edge.fromJson(JSON.parse(e))));
    return g;
  }

  constructor() {
    _vertices.set(this, new Map());
  }

  get vertices() {
    return Array.from(_vertices.get(this).values());
  }

  get edges() {
    return this.vertices.flatMap(v => v.outgoingEdges);
  }

  get size() {
    return _size.get(this);
  }

  createVertex(label, {size} = {}) {
    let vcs = _vertices.get(this);

    if (vcs.has(label)) {
      throw new Error(ERROR_MSG_VERTEX_DUPLICATED('Graph.addVertex', v));
    }
    
    let v = new Vertex(label, {size: size});

    vcs.set(consistentStringify(v.label), v);
    _vertices.set(this, vcs);
  }  

  addVertex(v) {
    if (!(v instanceof Vertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.addVertex', v));
    }
    let vcs = _vertices.get(this);
    
    if (vcs.has(v.label)) {
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

  createEdge(source, destination, {weight, label} = {}) {
    if (!this.hasVertex(source)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', source));
    }
    if (!this.hasVertex(destination)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', destination));
    }

    let u = getVertexFromGraph(this, source);
    let v = getVertexFromGraph(this, destination);
    u.addEdgeTo(v, {edgeWeight: weight, edgeLabel: label});
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

    let u = getVertexFromGraph(this, edge.source);
    let v = getVertexFromGraph(this, edge.destination);
    u.addEdgeTo(v, {edgeWeight: edge.weight, edgeLabel: edge.label});
  }
  
  hasEdge(edge) {
    if (!edge instanceof Edge) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.hasEdge', edge));
    }
    es = this.edges;
    return es.some(e => e.equals(edge));
  }

  toJson() {
    return JSON.stringify({
      vertices: this.vertices.map(v => v.toJson()),
      edges: this.edges.map(e => e.toJson())});
  }
  
  equals(g) {
    return (g instanceof Graph) && this.toJson() === g.toJson();
  }
}

/**
 * Utility method to extract a vertex from a graph.
 * This method should not be exposed because clients shouldn't be able to directly manipulate vertices.
 * 
 * @param {Graph} graph 
 * @param {Vertex|any} vertex 
 */
function getVertexFromGraph(graph, vertex) {
  let label;
  if (vertex instanceof Vertex) {
    label = vertex.label;
  } else {
    label = vertex;
  }
  return _vertices.get(graph).get(consistentStringify(label));
}


export class DirectedGraph extends Graph {

}

export class UndirectedGraph extends Graph {

}

export default Graph;