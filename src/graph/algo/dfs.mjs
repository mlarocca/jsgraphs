import { isDefined } from "../../common/basic.mjs";

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
   *
   * @param {String} targetId The ID of the final vertex in the path to be reconstructed.
   */
  connectedComponents() {
    throw new Error("unimplemented");
  }

  topologicalSort() {
    throw new Error("unimplemented");
  }
}

export default DfsResult;