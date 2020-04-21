// import { isDefined } from "../../common/basic.mjs";

class DfsResult {
  #acyclic;

  #timeDiscovered;

  #timeVisited;

  /**
   *
   * @param timeDiscovered For each vertex (ID) the time the vertex was first discovered.
   * @param timeVisited For each vertex (ID) the time the vertex was completely visited (all its neighbors visited).
   * @param acyclic True iff the graph is acyclic.
   */
  constructor(timeDiscovered, timeVisited, acyclic) {
    this.#acyclic = acyclic;
    this.#timeDiscovered = {...timeDiscovered};
    this.#timeVisited = {...timeVisited};

    Object.freeze(this.#timeDiscovered);
    Object.freeze(this.#timeVisited);
  }

  get timeDiscovered() {
    return this.#timeDiscovered;
  }

  get timeVisited() {
    return this.#timeVisited;
  }

  isAcyclic() {
    return this.#acyclic;
  }

  /**
   * @method verticesByVisitOrder
   * @for DfsResult
   *
   * @description
   * Computes an ordering of the vertices in the graph, based on the time their DFS-visit ended (last-visited-first).
   * If and only if the graph is DAG, this is a valid topological ordering.
   */
  verticesByVisitOrder() {
    return Object.keys(this.#timeDiscovered).sort((a, b) => this.#timeVisited[b] - this.#timeVisited[a]);
  }
}

export default DfsResult;