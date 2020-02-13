import UnionFind from '../disjointset/disjointset.js';
import DWayHeap from '../dway_heap/dway_heap.js';
import Cache from '../cache/cache.js';

const DEFAULT_SIZE = 1;
const CACHE_KEY_EDGES_LIST = 'edges_list';
const CACHE_KEY_NEGATIVE_EDGES = 'neg_edges_';
const CACHE_KEY_BFS = 'bfs_';
const CACHE_KEY_DFS = 'dfs_';
const CACHE_KEY_CONNECTED_COMPONENTS = 'cc_';
const CACHE_KEY_TOPOLOGICAL_ORDER = 'tp_';
const CACHE_KEY_TRANSPOSE_ADJ = 'tr_';
const CACHE_KEY_STRONGLY_CONNECTED_COMPONENTS = 'scc_';
const CACHE_KEY_KRUSKAL = 'kruskal_';
const CACHE_KEY_PRIM = 'prim_';
const CACHE_KEY_DIJKSTRA = 'dijkstra_';
const CACHE_KEY_BELLMAN_FORD = 'be-fo_';
const CACHE_KEY_FLOYD_WARSHALL = 'flo-wa_';
const CACHE_KEY_EDMONDS_KARP_CACHE = 'ed-karp_';
const CACHE_KEY_RELABEL_TO_FRONT = 'rel-to-f_';

const FIELD_COMPONENTS = 'components';

const ERROR_MSG_INIT = `Illegal argument: Graph template parameter`;
const ERROR_MSG_VERTEX_NOT_FOUND = `Illegal parameter: Vertex not in graph`;
const ERROR_MSG_DIJKSTRA_NEGATIVE_EDGE = `Cannot apply Dijkstra\'s Algorithm to this graph: negative edge(s) found`;
const ERROR_MSG_BELLMANFORD_NEGATIVE_CYCLE = `Cannot apply Bellman-Ford\'s Algorithm to this graph: a negative cycle has been found`;
const ERROR_MSG_FLOYDWARSHALL_NEGATIVE_CYCLE = `Cannot apply Floyd-Warshall\'s Algorithm to this graph: a negative cycle has been found`;
const ERROR_MSG_GEM_MAXROUNDS = `Illegal argument for gem method: maxRounds must be a positive integer`;
const ERROR_MSG_GEM_VIEWWIDTH = `Illegal argument for gem method: viewWidth must be a positive integer`;
const ERROR_MSG_GEM_VIEWHEIGHT = `Illegal argument for gem method: viewHeight must be a positive integer`;
const ERROR_MSG_KARGER = `Illegal argument for Karger method: runs must be a positive integer`;
const ERROR_MSG_EDMONDSKARP = `Illegal argument for Edmonds-Karp method: source and sink must be valid vertices`;
const ERROR_MSG_CONNECTTO_ILLEGAL_GRAPH_PARAM = `Illegal argument for connecTo: \'other\' must be a Graph`;
const ERROR_MSG_CONNECTTO_ILLEGAL_EDGES_PARAM = `Illegal argument for connectTo: \'edges\' must be an array of edges`;
const ERROR_MSG_CONNECTTO_VERTICES_COLLISION = `At least one vertex in \'other\' already belongs to this graph`;


const _cache = new WeakMap();


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
 * To improve the performance of the library, results for most of these algorithms
 * (excluding, of course, the randomized ones, like GEM or Karger's)
 * are cached so that, if the method is called again without any modification being applied
 * to the graph in the meantime, the result doesn't have to be recomputed.
 */
class Graph {

  constructor() {
    _cache.set(this, new Cache());
  }
}


export class DirectedGraph extends Graph {

}

export class UndirectedGraph extends Graph {

}