import { isDefined } from "../../common/basic.mjs";

class BfsResult {
  #distance;

  #predecessor;

  constructor(distance, predecessor) {
    this.#distance = distance;
    this.#predecessor = predecessor;

    Object.freeze(this.#distance);
    Object.freeze(this.#predecessor);
  }

  get distance() {
    return this.#distance;
  }

  get predecessor() {
    return this.#predecessor;
  }

  /**
   *
   * @param {String} targetId The ID of the final vertex in the path to be reconstructed.
   */
  reconstructPathTo(targetId) {
    let vertices = [];
    while (isDefined(targetId)) {
      vertices.push(targetId);
      targetId = this.#predecessor[targetId];
    }

    if (targetId === null) {
      return vertices.reverse();
    } else {
      return [];
    }
  }
}

export default BfsResult;