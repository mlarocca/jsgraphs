import { isNumber, range, toNumber } from "../../common/numbers.mjs";
import { ERROR_MSG_INVALID_ARGUMENT } from "../../common/errors.mjs";

export class Permutations {
  #current

  /**
   *
   * @param {Number} n The size of the permutation.
   */
  constructor(size) {
    const n = toNumber(size);
    if (!isNumber(size) || n <= 0) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Permutation()', 'size', size));
    }
    this.#current = range(0, n);
  }

  *all() {
    while (this.#current !== null) {
      yield this.#current.slice();
      this.next();
    }
  }

  next() {
    const n = this.#current?.length ?? 0;

    let i = n - 1;
    // Check if there is a next this.#current: unless the array is inversely sorted
    for (; i > 0 && this.#current[i - 1] >= this.#current[i]; i--) {
      // Nothing to do, just browsing the array
    }

    if (i <= 0) {
      this.#current = null;
      return null;
    }

    let j = n - 1;
    // Find successor
    for (; this.#current[j] <= this.#current[i - 1]; j--) {
      // Nothing to do
    }

    // swap the two elements
    let temp = this.#current[i - 1];
    this.#current[i - 1] = this.#current[j];
    this.#current[j] = temp;

    // Reverse the suffix by swapping elements at the same distance from the center
    for (let j = n - 1; i < j; i++, j--) {
      temp = this.#current[i];
      this.#current[i] = this.#current[j];
      this.#current[j] = temp;
    }
    return this.#current.slice(0);
  }
}