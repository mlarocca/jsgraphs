import Graph from "../../graph.mjs";
import { UndirectedGraph } from "../../graph.mjs";
import { ERROR_MSG_INVALID_ARGUMENT } from '../../../common/errors.mjs';


/**
 * @method isPlanar
 *
 * @description
 * Check if a graph can be drawn in the 2D plane without intersections between its edges.
 * WARNING: This implementation uses Kuratowski's theorem and its running time is exponential in the size of the graph.
 *          It is advisable NOT to run this method on large graphs (>20 vertices).
 *
 * @param {Graph} graph The graph to examine.
 * @return {boolean} True iff the graph is planar.
 */
export const isPlanar = (() => {
  return (graph) => {
    const cache = new Map();
    const setCache = (key, val) => {
      cache.set(key, val);
      return val;
    }

    if (!(graph instanceof Graph) || graph.isEmpty()) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('isPlanar', 'graph', graph));
    }
    if (graph.isDirected()) {
      graph = graph.symmetricClosure();
    }
    return isPlanarCacheClosure(graph);


    function isPlanarCacheClosure(graph) {
      const graphCas = graph.id;
      if (cache.has(graphCas)) {
        return cache.get(graphCas);
      }
      return setCache(graph, connectedComponentsGraphs(graph).every(isPlanarConnectedComponent));
    }

    /**
     * @method connectedComponentsGraphs
     * @for Graph
     * @description
     * Breaks down a graph into its connected components.
     *
     * @param graph {Graph} A graph.
     * @return {Array<Graph>} The set of subgraphs induced by the connected components.
     */
    function connectedComponentsGraphs(graph) {
      const ccs = graph.connectedComponents();
      if (ccs.size === 1) {
        return [graph];
      } else {
        return [...ccs].map(cc => graph.inducedSubGraph(cc));
      }
    }

    /**
     * Checks if a connected component is planar
     * @param {Graph} graph A connected, undirected graph.
     */
    function isPlanarConnectedComponent(graph) {
      const graphCas = graph.id;
      if (cache.has(graphCas)) {
        return cache.get(graphCas);
      }

      const n = graph.vertices.length;
      const m = graph.simpleEdges.length;

      if (n < 5) {
        return setCache(graphCas, true);
      }
      if (m > 3 * n - 6) {
        // b/c of Euler characterization of planar graphs
        return setCache(graphCas, false);
      }
      if (graph.isComplete())
      {
        // n >=5 => not planar
        return setCache(graphCas, false);
      }

      if (n >= 6) {
        const [bipartite, p1, p2] = graph.isBipartite();
        if (bipartite && p1.size >= 3 && p2.size >= 3) {
          if (graph.isCompleteBipartite()) {
            return setCache(graphCas, false);
          }
        }
      }

      // Now we need to build the recursion
      for (const v of graph.vertices) {
        // Create an induced subgraph with all vertices except the selected one
        let vSet = new Set(graph.vertices);
        vSet.delete(v);
        const g = graph.inducedSubGraph(vSet);

        if (!isPlanarConnectedComponent(g)) {
          return setCache(graphCas, false);
        }
      }

      for (const e of graph.simpleEdges) {
        // Create a spanning subgraph with all edges except selected
        // Exclude both the edge and its reverse
        let g = new UndirectedGraph();
        graph.vertices.forEach(v => g.addVertex(v));

        graph.simpleEdges.forEach(e1 => {
          if (e.source.id !== e1.source.id || e.destination.id !== e1.destination.id) {
            g.addEdge(e1);
          }
        });

        if (!isPlanarCacheClosure(g)) {
          return setCache(graphCas, false);
        }
      }
      return setCache(graphCas, true);
    }
  }
})();