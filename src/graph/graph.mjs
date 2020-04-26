import Edge from './edge.mjs';
import Vertex from './vertex.mjs';

import BfsResult from './algo/bfs.mjs';
import DfsResult from './algo/dfs.mjs';

import { isDefined, isUndefined } from '../common/basic.mjs';

import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_DUPLICATED, ERROR_MSG_VERTEX_NOT_FOUND } from '../common/errors.mjs';
import { consistentStringify } from '../common/strings.mjs';
import { isNumber, range } from '../common/numbers.mjs';
import { ERROR_MSG_EDGE_NOT_FOUND } from '../common/errors';
import { size } from '../common/basic.mjs';


const _vertices = new WeakMap();

class MutableVertex extends Vertex {
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
   * @return {MutableVertex}  The Vertex created.
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
      if (!(edge instanceof Edge) || this.id !== edge.source.id) {
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
    for (const edgesArray of this.#adjacencyMap.values()) {
      const n = edgesArray.length;
      if (n > 0) {
        yield edgesArray[n - 1];
      }
    }
  }

  outDegree() {
    let n = 0;
    for (const edgesArray of this.#adjacencyMap.values()) {
      if (edgesArray.length > 0) {
        ++n;
      }
    }
    return n;
  }

  /**
   *
   * @param {MutableVertex} v
   * @returns {undefined}
   */
  edgeTo(v) {
    if (!(v instanceof MutableVertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.edgeTo', 'v', v));
    }

    const edges = this.#adjacencyMap.get(v.id) ?? [];
    const n = edges.length;
    return n > 0 ? edges[n - 1] : undefined;
  }

  addEdge(edge) {
    if ((!(edge instanceof Edge)) || this.id !== edge.source.id) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.addEdge', 'edge', edge));
    }
    return replaceEdgeTo(this.#adjacencyMap, edge.destination, edge);
  }

  addEdgeTo(v, { edgeWeight, edgeLabel } = {}) {
    if (!(v instanceof MutableVertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.addEdgeTo', 'v', v));
    }
    const edge = new Edge(this, v, { weight: edgeWeight, label: edgeLabel });
    this.addEdge(edge);
    return edge;
  }

  removeEdge(edge) {
    if (!(edge instanceof Edge) || this.id !== edge.source.id) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.removeEdge', 'edge', edge));
    }
    return replaceEdgeTo(this.#adjacencyMap, edge.destination);
  }

  removeEdgeTo(v) {
    if (!(v instanceof MutableVertex)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('GVertex.removeEdgeTo', 'v', v));
    }
    return replaceEdgeTo(this.#adjacencyMap, v);
  }

  /**
   * @override
   */
  clone() {
    return new MutableVertex(this.label, { weight: this.weight });
  }

  /**
   * @override
   */
  toString() {
    // Use a different bracket to make it possible to distinguish this from regular vertices
    return `{${this.id}}`;
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
  let edgesToDest = [];

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
 *   - DFS
 *   - BFS
 *   - Kruskal and Prim's algorithms (on undirected graphs) (ToDo)
 *   - Connected components
 *   - Strongly connected components
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
    vertices.forEach(v => g.addVertex(MutableVertex.fromJsonObject(v)));
    edges.forEach(e => g.addEdge(Edge.fromJsonObject(e)));
    return g;
  }

  static completeGraph(n) {
    if (!isNumber(n) || n < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.completeGraph', 'n', n));
    }

    let g = new Graph();
    let vertexIDs = [];
    const r = range(1, n + 1);
    r.forEach(i => vertexIDs[i] = g.createVertex(i));
    r.forEach(i =>
      range(i + 1, n + 1).forEach(j => {
        g.createEdge(vertexIDs[i], vertexIDs[j]);
        g.createEdge(vertexIDs[j], vertexIDs[i]);
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

    let g = new Graph();
    let vertexIDs = [];
    const r1 = range(1, n + 1);
    const r2 = range(n + 1, n + m + 1);
    r1.forEach(i => vertexIDs[i] = g.createVertex(i));
    r2.forEach(j => vertexIDs[j] = g.createVertex(j));

    r1.forEach(i => r2.forEach(j => {
      g.createEdge(vertexIDs[i], vertexIDs[j]);
      g.createEdge(vertexIDs[j], vertexIDs[i]);
    }));

    return g;
  }

  constructor() {
    _vertices.set(this, new Map());
  }

  /**
   * @property id
   * @getter
   * @description
   * A unique ID, uniquely identifying graphs (based on vertices' and edges' IDs, not optional properties)
   */
  get id() {
    return `${this.vertices.map(v => `{${v.id}}`).sort().join('')}|${this.edges.map(e => e.id).sort().join('')}`;
  }

  /**
   *
   */
  get vertices() {
    return [...getVertices(this)];
  }

  get edges() {
    return [...getEdges(this)];
  }

  /**
   * @property simpleEdges
   * @getter
   * @for Graph
   *
   * @description
   * Returns a list of all edges in the graph, except loops.
   *
   * @return {Array<Edge>} A list of the simple edges of the graph.
   */
  get simpleEdges() {
    // We can just check IDs, because they are unique in a graph.
    return [...getEdges(this)].filter(e => e.source.id !== e.destination.id);
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

  isEmpty() {
    return this.vertices.length === 0;
  }

  createVertex(label, { weight } = {}) {
    if (this.hasVertex(Vertex.idFromLabel(label))) {
      throw new Error(ERROR_MSG_VERTEX_DUPLICATED('Graph.createVertex', label));
    }

    const v = new MutableVertex(label, { weight: weight });

    let vcs = _vertices.get(this);
    vcs.set(v.id, v);
    _vertices.set(this, vcs);

    return v.id;
  }

  addVertex(vertex) {
    if (!(vertex instanceof Vertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.addVertex', vertex));
    }
    let vcs = _vertices.get(this);

    if (this.hasVertex(vertex.id)) {
      throw new Error(ERROR_MSG_VERTEX_DUPLICATED('Graph.addVertex', vertex));
    }

    const v = new MutableVertex(vertex.label, { weight: vertex.weight });
    vcs.set(vertex.id, v);
    _vertices.set(this, vcs);

    return v.id;
  }

  hasVertex(vertex) {
    const v = getGraphVertex(this, vertex);
    return isDefined(v) && (v instanceof MutableVertex);
  }

  getVertex(vertex) {
    return getGraphVertex(this, vertex);
  }

  /**
   * For a regular graph, returns the size of the adjacency vector for this vertex (as to each destination,
   * at most one edge is allowed).
   * @returns {*}
   */
  getVertexOutDegree(vertex) {
    const v = getGraphVertex(this, vertex);
    return v?.outDegree();
  }

  getVertexWeight(vertex) {
    const v = getGraphVertex(this, vertex);
    return v?.weight;
  }

  setVertexWeight(vertex, weight) {
    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Graph.setVertexWeight', 'weight', weight));
    }
    let v = getGraphVertex(this, vertex);
    if (isDefined(v)) {
      v.weight = weight;
    } else {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.setVertexWeight', vertex));
    }
  }

  createEdge(source, destination, { weight, label } = {}) {
    if (!this.hasVertex(source)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', source));
    }
    if (!this.hasVertex(destination)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.createEdge', destination));
    }

    const u = getGraphVertex(this, source);
    const v = getGraphVertex(this, destination);
    return u.addEdgeTo(v, { edgeWeight: weight, edgeLabel: label }).id;
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

    const u = getGraphVertex(this, edge.source);
    const v = getGraphVertex(this, edge.destination);
    return u.addEdgeTo(v, { edgeWeight: edge.weight, edgeLabel: edge.label }).id;
  }

  /**
   *
   * @param {Edge|string} edge Either a string with the edge's id, or an instance of Edge
   */
  hasEdge(edge) {
    return isDefined(this.getEdge(edge));
  }

  hasEdgeBetween(source, destination) {
    const e = getGraphEdge(this, source, destination);
    return isDefined(e) && (e instanceof Edge);
  }

  getEdgeBetween(source, destination) {
    return getGraphEdge(this, source, destination);
  }

  getEdge(edge) {
    edge = edgeId(edge);

    for (const e of getEdges(this)) {
      if (e.id === edge) {
        return e;
      }
    }
    return undefined;
  }

  *getEdgesFrom(vertex) {
    const u = getGraphVertex(this, vertex);
    if (isUndefined(u)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.getEdgesFrom', vertex));
    }
    yield* u.outgoingEdges();
  }

  /**
   * @method getEdgesInPath
   * @for Graph
   * @description
   * Takes a path, in the form of a sequence of vertices, and returns the sequence of edges in the path.
   *
   * @param {Array} verticesSequence The sequence of vertices in a path, from start to end.
   * @return {Array<Edge>} The list of edges to get from the first to the last vertex in the path.
   */
  getEdgesInPath(verticesSequence) {
    if (!Array.isArray(verticesSequence)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Graph.getEdgesInPath', 'verticesSequence', verticesSequence));
    }
    const n = verticesSequence.length;
    const edges = [];

    for (let i = 0; i < n - 1; i++) {
      const source = vertexId(verticesSequence[i]);
      const dest = vertexId(verticesSequence[i + 1]);

      const e = this.getEdgeBetween(source, dest);
      if (!isDefined(e)) {
        throw new Error(ERROR_MSG_EDGE_NOT_FOUND('Graph.getEdgesInPath', `${source}->${dest}`));
      }
      edges.push(e);
    }
    return edges;
  }

  setEdgeWeight(edge, weight) {
    if (!isNumber(weight)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Graph.setEdgeWeight', 'weight', weight));
    }
    const e = this.getEdge(edge);
    if (isDefined(e)) {
      e.weight = weight;
    } else {
      throw new Error(ERROR_MSG_EDGE_NOT_FOUND('Graph.setEdgeWeight', edge));
    }
  }

  /**
   * Shortcut to avoid edge cloning
   * @param {*} sourceLabel
   * @param {*} destinationLabel
   */
  getEdgeWeight(sourceLabel, destinationLabel) {
    const e = getGraphEdge(this, sourceLabel, destinationLabel);
    return e?.weight;
  }

  /**
   * Shortcut to avoid edge cloning
   * @param {*} sourceLabel
   * @param {*} destinationLabel
   */
  getEdgeLabel(sourceLabel, destinationLabel) {
    const e = getGraphEdge(this, sourceLabel, destinationLabel);
    return e?.label;
  }

  /**
   * @method inducedSubGraph
   * @for Graph
   *
   * @description
   * Computes the induced sub-graph of this graph, given a subset of its vertices.
   * The induced sub-graph of a graph G is a new graph, with only a subset of its vertices; only the edges in G
   * that are adjacent to vertices in the sub-graph are included.
   * @param {Set<Vertex|String>|Array<Vertex|String>} vertices A non-empty subset of this graph's vertices.
   *
   * @return {Graph} The sub-graph induced by vertices.
   */

  inducedSubGraph(vertices) {
    return inducedSubGraph(this, vertices);
  }

  clone() {
    const g = new Graph();
    for (const v of getVertices(this)) {
      g.addVertex(v.clone());
    }
    for (const e of getEdges(this)) {
      g.addEdge(e.clone());
    }
    return g;
  }

  /**
   * @override
   */
  toString() {
    return [...this.edges].map(e => e.toString()).sort().join(', ');
  }

  toJson() {
    return consistentStringify(this.toJsonObject());
  }

  toJsonObject() {
    return {
      vertices: [...getVertices(this)].sort().map(v => v.toJsonObject()),
      edges: [...getEdges(this)].sort(Edge.compareEdges).map(e => e.toJsonObject())
    };
  }

  equals(g) {
    return (g instanceof Graph) && this.toJson() === g.toJson();
  }

  // ALGORITHMS

  /**
   * @method isConnected
   * @for Graph
   *
   * @description
   * Check if the graph is connected, i.e., for a directed graph, if its symmetric closure has a single
   * connected component comprising all vertices.
   * A connected component is a set CC of vertices in an undirected graph such that from each vertex in CC you can
   * reach all other vertices in CC.
   *
   * @return {boolean} True iff the graph is connected.
   */
  isConnected() {
    return this.symmetricClosure().isConnected();
  }

  /**
   * @method isStronglyConnected
   * @for UndirectedGraph
   *
   * @description
   * Check if the graph is connected, i.e. if there is a single strongly connected component comprising all vertices.
   * A strongly connected component is a set CC of vertices in a directed graph such that from each vertex in CC you can
   * reach all other vertices in CC. In undirected graphs, connected components are also strongly connected components.
   *
   * @return {boolean} True iff the graph is connected.
   */
  isStronglyConnected() {
    return this.stronglyConnectedComponents().size === 1;
  }

  /**
   * @method isAcyclic
   * @for Graph
   * @description
   * Check if a graph is acyclic, or if it has a cycle.
   *
   * @return {boolean} True iff the graph is acyclic.
   */
  isAcyclic() {
    const dfsResult = this.dfs();
    return dfsResult.isAcyclic();
  }

  /**
   * @method isBipartite
   * @for Graph
   *
   * @description
   * Check if a graph is a bipartite graph, i.e. vertices can be partitioned into two non-empty sets, say A and B,
   * such that vertices in A are only connected to vertices in B: there is no edge (u,v) such that u is in A and v in B,
   * or vice versa.
   *
   * @return {[boolean, Set<String>, Set<String>]} The first entry is true iff the graph is bipartite.
   *                                               The two partitions are null if the graph is not bipartite,
   *                                               otherwise they are two Sets with the indices of the vertices
   *                                               in the partition.
   */
  isBipartite() {
    // The symmetric closure of a directed graph is certainly an undirected graph.
    return this.symmetricClosure().isBipartite();
  }

  /**
   * @method isComplete
   * @for Graph
   *
   * @description
   * Check if a graph is a complete graph, i.e. every vertex is adjacent to all the other vertices.
   *
   * @return {boolean} True iff the graph is complete.
   */
  isComplete() {
    const n = this.vertices.length;
    const m = this.simpleEdges.length;
    return m === n * (n - 1);
  }

  /**
   * @method isCompleteBipartite
   * @for Graph
   *
   * @description
   * Check if a graph is a complete bipartite graph, i.e. the graph is bipartite and
   * every vertex on the first partition is adjacent to all, and just, the vertices in the other partition.
   *
   * @return {boolean} True iff the graph is complete bipartite.
   */
  isCompleteBipartite() {
    const [bipartite, partition1, partition2] = this.isBipartite();

    const m = this.simpleEdges.length;
    // In directed graphs there are 2 edges between each pair of vertices across the partitions
    return bipartite && m === 2 * partition1.size * partition2.size;
  }

  /**
   * @method symmetricClosure
   * @for Graph
   *
   * @description
   * Computes the symmetric closure of this instance.
   * The symmetric closure of a graph G is a new graph G' that has both edges, (u,v) and (v,u),
   * whenever graph G has either the edge (u,v) or (v,u) (or both).
   * Informally, the symmetric closure of the directed graph G is an undirected graph G' with the same edges,
   * but disregarding their direction.
   * WARNING: edges in symmetric closure won't retain any of the original labels.
   * This is because, in case a direct graph has both edges (u,v) and (v,u), but with different labels,
   * then it wouldn't be possible to have a consistent undirected edge by choosing either label.
   * Conversely, if both edges are present, we can use the sum of the weights as the weight of the undirected edge.
   *
   * @return {Graph} The symmetric closure graph of this instance, as a new graph.
   */
  symmetricClosure() {
    let graph = new UndirectedGraph();
    for (const v of this.vertices) {
      graph.addVertex(v);
    }
    for (const e of this.edges) {
      if (!graph.hasEdge(e)) {
        const eT = this.getEdgeBetween(e.destination, e.source)
        let weight = e.weight + (eT?.weight ?? 0);
        // Leverages the nature of undirected graphs: when you add an edge, it also adds its symmetric.
        graph.createEdge(e.source, e.destination, { weight: weight });
      }
    }
    return graph;
  }


  /**
   * @method transpose
   * @for Graph
   *
   * @description
   * Computes the transposed graph of this instance.
   * The transpose graph G' of a graph G is a new graph that has an edge (u,v) if and only if
   * G has an edge (v,u).
   *
   * @return {Graph} The transposed graph of this instance, as a new graph.
   */
  transpose() {
    let graph = new Graph();
    for (const v of this.vertices) {
      graph.addVertex(v);
    }
    for (const e of this.edges) {
      graph.addEdge(e.transpose());
    }
    return graph;
  }

  /**
   * @method transitiveClosure
   * @for Graph
   *
   * @description
   * Computes the transitive closure of this graph.
   * The transitive closure of a Graph G is a new graph G' with an edge (u,v) for each pair
   * of vertices in G such that there is a path (in G) from u to v.
   *
   * @return {Graph} The transitive closure of this instance, as a new graph.
   */
  transitiveClosure() {
    throw new Error("Unimplemented");
  }

  /**
   * @method bfs
   * @for Graph
   * @param {Vertex|string} start
   * @return {BfsResult}
   */
  bfs(start) {
    const s = this.getVertex(start);

    if (!isDefined(s)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.bfs', start));
    }

    let distance = {};
    let predecessor = {};
    for (const v of this.vertices) {
      distance[v.id] = Infinity;
    }

    distance[s.id] = 0;
    predecessor[s.id] = null;

    let queue = [s];

    while (queue.length > 0) {
      const u = queue.pop(0);

      const adj = u.outgoingEdges();
      for (const e of adj) {
        const v = e.destination;
        if (distance[v.id] === Infinity) {
          predecessor[v.id] = u.id;
          distance[v.id] = distance[u.id] + 1;
          queue.push(v);
        }
      }
    }

    return new BfsResult(distance, predecessor);
  }

  /**
   * @method dfs
   * @for Graph
   *
   * @return {DfsResult}
   */
  dfs() {
    let timeDiscovered = {};
    let timeVisited = {};
    let currentTime = 0;
    let acyclic = true;

    this.vertices.forEach(v => {
      if (!timeDiscovered[v.id]) {
        timeDiscovered[v.id] = ++currentTime;
        [currentTime, acyclic] = dfs(this, v, timeDiscovered, timeVisited, acyclic, currentTime);
      }
    });

    return new DfsResult(timeDiscovered, timeVisited, acyclic)
  }

  /**
   * @method connectedComponents
   * @for Graph
   *
   * @description
   * Computes the connected components of a graph. A connected component is a set of vertices CC such that from
   * each vertex u belonging CC there is a path in the symmetric closure of this graph to every other vertex v belonging
   * to CC.
   *
   * @return {Set<Set<String>>} A collection of the connected components in the graph: each cc being returned as a set
   *                            of the indices of the vertices in it.
   */
  connectedComponents() {
    return this.symmetricClosure().connectedComponents();
  }

  /**
   * @method topologicalOrdering
   * @for Graph
   *
   * @description
   * Return one of the possible topological orderings of vertices, if the graph is a DAG (direct, acyclic graph).
   * If the graph is not acyclic, returns null.
   *
   * @return {null|Array<String>} If a topological ordering is defined, returns a list of vertex' IDs. Otherwise, null.
   */
  topologicalOrdering() {
    const dfs = this.dfs();
    if (dfs.isAcyclic()) {
      return dfs.verticesByVisitOrder();
    } else {
      // Topological ordering is defined only for
      return null;
    }
  }

  /**
   * @method stronglyConnectedComponents
   * @for Graph
   *
   * @description
   * Computes the strongly connected components of a graph. A connected component for a directed graph is a set of vertices
   * SCC such that from each vertex u belonging CC there is a path in this graph to every other vertex v belonging to CC.
   * So that, for each couple of vertices u, v, v is reachable from u and, vice versa, u is reachable from v.
   */
  stronglyConnectedComponents() {
    // Implements Kosaraju's algorithm
    const ordering = this.transpose().dfs().verticesByVisitOrder();
    let timeDiscovered = {};
    let currentTime = 0;
    let stronglyConnectedComponents = new Set();

    ordering.forEach(vID => {
      if (!timeDiscovered[vID]) {
        let timeVisited = {};
        let acyclic = true;  // lgtm [js/useless-assignment-to-local]
        timeDiscovered[vID] = ++currentTime;
        [currentTime, acyclic] = dfs(this, this.getVertex(vID), timeDiscovered, timeVisited, acyclic, currentTime);   // lgtm [js/useless-assignment-to-local]
        // we reset timeVisited at each run of dfs, so the only vertices with an entry are the ones in this CC.
        stronglyConnectedComponents.add(new Set(Object.keys(timeVisited)));
      }
    });

    return stronglyConnectedComponents;
  }
}


/**
 * @class UndirectedGraph
 */
export class UndirectedGraph extends Graph {
  static completeGraph(n) {
    if (!isNumber(n) || n < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('UndirectedGraph.completeGraph', 'n', n));
    }

    let g = new UndirectedGraph();
    let vertexIDs = [];
    const r = range(1, n + 1);
    r.forEach(i => vertexIDs[i] = g.createVertex(i));
    r.forEach(i =>
      range(i + 1, n + 1).forEach(j => {
        g.createEdge(vertexIDs[i], vertexIDs[j]);
      }));

    return g;
  }

  static completeBipartiteGraph(n, m) {
    if (!isNumber(n) || n < 1) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('UndirectedGraph.completeBipartiteGraph', 'n', n));
    }

    if (!isNumber(m) || m < 1) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('UndirectedGraph.completeBipartiteGraph', 'm', m));
    }

    let g = new UndirectedGraph();
    let vertexIDs = [];
    const r1 = range(1, n + 1);
    const r2 = range(n + 1, n + m + 1);
    r1.forEach(i => vertexIDs[i] = g.createVertex(i));
    r2.forEach(j => vertexIDs[j] = g.createVertex(j));

    r1.forEach(i => r2.forEach(j => {
      g.createEdge(vertexIDs[i], vertexIDs[j]);
    }));

    return g;
  }

  /**
   * Return all edges in the graph. Since in undirected graphs the direction of an edge doesn't count,
   * it deliberately order vertices such that for edge (u,v) u <= v.
   */
  get edges() {
    // For directed graphs, we only want one of the two directed edges back...
    return [...getEdges(this)].filter(e => e.source.id <= e.destination.id);
  }

  /**
   * Return all edges in the graph, except loops. Since in undirected graphs the direction of an edge doesn't count,
   * it deliberately order vertices such that for edge (u,v) u < v.
   */
  get simpleEdges() {
    // For directed graphs, we only want one of the two directed edges back...
    return [...getEdges(this)].filter(e => e.source.id < e.destination.id);
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
    const eId = super.createEdge(source, destination, { weight: weight, label: label });
    const e = super.getEdge(eId);

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

    const u = getGraphVertex(this, edge.source);
    const v = getGraphVertex(this, edge.destination);
    const e = u.addEdgeTo(v, { edgeWeight: edge.weight, edgeLabel: edge.label });
    if (!e.isLoop()) {
      v.addEdgeTo(u, { edgeWeight: edge.weight, edgeLabel: edge.label });
    }
    return e;
  }

  clone() {
    let g = new UndirectedGraph();
    for (const v of getVertices(this)) {
      g.addVertex(v.clone());
    }
    for (const e of getEdges(this)) {
      g.addEdge(e.clone());
    }
    return g;
  }

  // ALGORITHMS

  /**
   * @method connectedComponents
   * @for UndirectedGraph
   *
   * @description
   * Computes the connected components of a graph. A connected component is a set of vertices CC such that from
   * each vertex u belonging CC there is a path in the graph to every other vertex v belonging to CC.
   *
   * @return {Set<Set<String>>} A collection of the connected components in the graph: each cc being returned as a set
   *                            of the indices of the vertices in it.
   */
  connectedComponents() {
    let timeDiscovered = {};
    let currentTime = 0;
    let connectedComponents = new Set();

    this.vertices.forEach(v => {
      if (!timeDiscovered[v.id]) {
        let timeVisited = {};
        let acyclic = true;  // lgtm [js/useless-assignment-to-local]
        timeDiscovered[v.id] = ++currentTime;
        [currentTime, acyclic] = dfs(this, v, timeDiscovered, timeVisited, acyclic, currentTime);   // lgtm [js/useless-assignment-to-local]
        // we reset timeVisited at each run of dfs, so the only vertices with an entry are the ones in this CC.
        connectedComponents.add(new Set(Object.keys(timeVisited)));
      }
    });

    return connectedComponents;
  }

  /**
   * @method isConnected
   * @for UndirectedGraph
   *
   * @description
   * Check if the graph is connected, i.e. if there is a single connected component comprising all vertices.
   * A connected component is a set CC of vertices in an undirected graph such that from each vertex in CC you can
   * reach all other vertices in CC.
   *
   * @return {boolean} True iff the graph is connected.
   */
  isConnected() {
    return this.connectedComponents().size === 1;
  }

  /**
   * @method isBipartite
   * @for UndirectedGraph
   *
   * @description
   * Check if a graph is a bipartite graph, i.e. vertices can be partitioned into two non-empty sets, say A and B,
   * such that vertices in A are only connected to vertices in B: there is no edge (u,v) such that u is in A and v in B,
   * or vice versa.
   *
   * @return {[boolean, Set<String>, Set<String>]} The first entry is true iff the graph is bipartite.
   *                                               The two partitions are null if the graph is not bipartite,
   *                                               otherwise they are two Sets with the indices of the vertices
   *                                               in the partition.
   */
  isBipartite() {
    // Only connected graphs with at least 2 vertices can be bipartite
    if (this.vertices.length < 2 || !this.isConnected()) {
      return [false, null, null];
    }

    // If a graph is connected, then it's not empty
    const s = getVertices(this).next().value;

    let colors = {};
    colors[s.id] = true;

    let queue = [s];

    while (queue.length > 0) {
      const u = queue.pop(0);
      const c = colors[u.id];

      for (const e of u.outgoingEdges()) {
        const v = e.destination;
        if (isUndefined(colors[v.id])) {
          // Assign the opposite color to the edge's destination
          colors[v.id] = !c;
          queue.push(v);
        } else if (colors[v.id] === c) {
          // If the destination was assigned the same color as the source, the graph is not bipartite
          return [false, null, null];
        }
      }
    }

    // Now we know it's bipartite: reconstruct partitions
    let partition1 = [];
    let partition2 = [];
    for (const v of getVertices(this)) {
      if (colors[v.id]) {
        partition1.push(v.id);
      } else {
        partition2.push(v.id);
      }
    }

    return [true, new Set(partition1), new Set(partition2)];
  }

  /**
   * @method isComplete
   * @for UndirectedGraph
   *
   * @description
   * Check if a graph is a complete graph, i.e. every vertex is adjacent to all the other vertices.
   *
   * @return {boolean} True iff the graph is complete.
   */
  isComplete() {
    const n = this.vertices.length;
    const m = this.simpleEdges.length;
    // Only half of the directed edges are returned in an undirected graph
    return m === n * (n - 1) / 2;
  }

  /**
   * @method isCompleteBipartite
   * @for UndirectedGraph
   *
   * @description
   * Check if a graph is a complete bipartite graph, i.e. the graph is bipartite and
   * every vertex on the first partition is adjacent to all, and just, the vertices in the other partition.
   *
   * @return {boolean} True iff the graph is complete bipartite.
   */
  isCompleteBipartite() {
    const [bipartite, partition1, partition2] = this.isBipartite();

    const m = this.simpleEdges.length;
    // Only half of the directed edges are returned in an undirected graph
    return bipartite && m === partition1.size * partition2.size;
  }

  /**
   * @method symmetricClosure
   * @for UndirectedGraph
   *
   * @description
   * Computes the symmetric closure of this instance.
   * For an undirected graph, the symmetric closure of a graph is the graph itself
   *
   * @return {Graph} The symmetric closure graph of this instance, as a new graph.
   */
  symmetricClosure() {
    return this.clone();
  }

  /**
   * @method transpose
   * @for UndirectedGraph
   *
   * @description
   * Computes the transposed graph of this instance.
   * For an undirected graph, G and its transpose are the same graph.
   *
   * @return {Graph} The transposed graph of this instance, as a new graph.
   */
  transpose() {
    return this.clone();
  }

  topologicalOrdering() {
    // Undirect graphs can't have a topological ordering
    return null;
  }

  stronglyConnectedComponents() {
    // For an undirected graph, each connected component is also a strongly connected component.
    return this.connectedComponents();
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
 * @param {MutableVertex|any} vertex
 */
function getGraphVertex(graph, vertex) {
  let vcs = _vertices.get(graph);
  return vcs?.get(vertexId(vertex));
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
  let v = getGraphVertex(graph, destination);

  if (isUndefined(v)) {
    return undefined;
  }
  return u?.edgeTo(v);
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
  for (const v of getVertices(graph)) {
    yield* v.outgoingEdges();
  }
}

/**
 * @private
 * @param {string|Vertex} vertex Either an instance of Vertex, or a vertex' id.
 */
function vertexId(vertex) {
  if (vertex instanceof Vertex) {
    return vertex.id;
  } else {
    return vertex;
  }
}

/**
 * @private
 * @param {Edge?} edge
 */
function edgeId(edge) {
  if (edge instanceof Edge) {
    return edge.id;
  } else {
    return edge;
  }
}


/**
 * @method dfs
 * @for Graph
 * @private
 * @description DFS method on graphs.
 *
 * @param {Graph} graph The graph on which we run DFS.
 * @param {Vertex} v The vertex from which we start DFS visit.
 * @param {Object} timeDiscovered Record track of the times when each vertex was first discovered.
 * @param {Object} timeVisited Record track of the times when each vertix visit was completed.
 * @param {boolean} acyclic A flag: true if the graph is acyclic.
 * @param {int} currentTime A counter to keep track of the time of discovery/visit of vertices.
 *
 * @return A pair with the updated values for current time and acyclic.
 */
function dfs(graph, v, timeDiscovered, timeVisited, acyclic, currentTime) {
  let popped = {};
  let stack = [v];
  let path = [];

  do {
    const u = stack.pop();

    if (popped[u.id]) {
      // The vertex was already popped once from the stack,
      // the second time it happens means we have finished visiting its children
      timeVisited[u.id] = ++currentTime;
      path.pop();
    } else {
      // First time this is popped from the stack: record that, and push it back, so it will be popped again
      // after visiting all its children.
      popped[u.id] = true;
      stack.push(u);
      path.push(u.id);

      // Put all undiscovered children of current vertex on the stack, to be later visited.
      for (const e of graph.getEdgesFrom(u.id)) {
        const w = e.destination;
        if (isUndefined(timeDiscovered[w.id])) {
          // First time we discover vertex w: record that and add it to the stack
          timeDiscovered[w.id] = ++currentTime;
          stack.push(w);
        } else {
          // If a neighbor of current graph was already discovered, then we have a cycle.
          // if the graph is undirected check that the path is longer than 1 edge
          if (e.isLoop() ||
            !timeVisited[w.id] &&
            (graph.isDirected() || path[path.length - 1] !== w.id) &&
            (path.indexOf(w.id) >= 0)) {
            acyclic = false;
          }
        }
      };
    }
  } while (stack.length > 0);

  return [currentTime, acyclic];
}

/**
 * @method inducedSubGraph
 * @for Graph
 * @private
 *
 * @param {Graph} graph The original graph
 * @param {Collection<Vertex|String>} vertices
 */
function inducedSubGraph(graph, vertices) {
  if (!isDefined(vertices) || size(vertices) === 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('Graph.inducedSubGraph', 'vertices', vertices));
  }

  let subGraph = graph.isDirected() ? new Graph() : new UndirectedGraph();

  if (!(vertices instanceof Set)) {
    // Make sure it's a set
    vertices = new Set(vertices);
  }

  vertices.forEach(u => {
    const v = graph.getVertex(u);
    if (!isDefined(v)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Graph.inducedSubGraph', u));
    }
    subGraph.addVertex(v);
  });

  graph.edges.forEach(e => {
    if (vertices.has(e.source.id) && vertices.has(e.destination.id)) {
      subGraph.addEdge(e);
    }
  });
  return subGraph;
}

export default Graph;