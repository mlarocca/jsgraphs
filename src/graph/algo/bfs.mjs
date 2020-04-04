class BfsResult {
  #distance;

  #predecessor;

  constructor() {
    this.#distance = {};
    this.#predecessor = {};
  }

  get distance() {
    return this.#distance;
  }

  get predecessor() {
    return this.#predecessor;
  }

  reconstructPath(start, goal) {

  }
}

export default BfsResult;