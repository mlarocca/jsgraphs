import Graph from "../../../graph/graph.mjs";
import { randomInt } from "../../../common/numbers.mjs";
import { simulatedAnnealing } from "./simulated_annealing.mjs";

/**
 * @name tsp
 * @description
 * Solve the tsp problem using simulated annealing optimization.
 *
 * @param {Graph} graph The (complete) graph for which we need to find the best tour.
 * @param {Number} maxSteps The maximum number of optimization steps to be performed.
 * @param {Number} T0 Initial temperature of the system. This value must be positive.
 * @param {Number} k The Boltzmann constant, used to adjust the acceptance probability of worse solutions. This value must be positive.
 * @param {Number} alpha The decay rate for the temperature: every 0.1% of the steps, the temperature will be update using the rule T = alpha*T.
 *                       This must be between 0 and 1 (both excluded).
 * @param {Boolean} verbose If true, prints a summary message at each iteration.
 *
 * @return {Object} A POJO with two fields:
 *  - solution: The vertex permutation corresponding to the optimum found by the algorithm (not guaranteed to be optimal);
 *  - cost: The sum of the edges in the best tour found.
 */
export default function tsp(graph, maxSteps, T0 = 200, k = 1000, alpha = 0.99, verbose = false) {
  if (!(graph instanceof Graph) || graph.isEmpty()) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('tsp', 'graph', graph));
  }
  // NB: The other parameters will be validated by method simulatedAnnealing
  // Choose an initial solution, keeping the initial vertex fixed
  const P0 = shuffle(graph.vertices, 1);
  // Start simulated annealing
  const solution = simulatedAnnealing(tspTourCost.bind(null, graph), randomTspStep, maxSteps, P0, T0, k, alpha, verbose);
  return { solution: solution, cost: tspTourCost(graph, solution) };
}

/**
 * @name tspTourCost
 * @private
 * @description
 * Computes the cost of a single solution (a permutation of the vertices) for the TSP on a given graph.
 *
 * @param {Graph} graph The input graph.
 * @param {Array<Vertex>} P A permutation of `graph`'s vertices.
 *
 * @return {Number} The cost of the tour made of edges P[i]->P[i+1] between adjacent vertices in P (including the one wrapping
 *                  over the end of the array).
 */
function tspTourCost(graph, P) {
  const n = P.length;
  let totalCost = 0;
  for (let i = 0; i < n - 1; i++) {
    const e = graph.getEdgeBetween(P[i], P[i + 1]);
    totalCost += e.weight;
  }
  const e = graph.getEdgeBetween(P[n - 1], P[0]);
  totalCost += e.weight;
  return totalCost;
}

/**
 * @name swapAdjacentPairs
 * @private
 * @description
 * Swap two adjacent elements in an array. The first element's index is chosen randomly,
 * but the first element in the array will never be involved.
 * Warning: this method has side-effects and the input array will be changed.
 *
 * @param {Array} P A generic array.
 *
 * @return {Array<Vertex>} The same array passed, with two adjacent elements P[i] and P[i+1], 0 < i < n-1, swapped.
 */
function swapAdjacentPairs(P) {
  const n = P.length;
  // We assume vertex 0 is fixed
  const i = randomInt(1, n - 1);
  return swap(P, i, i + 1);
}

/**
 * @name swapRandomPairs
 * @private
 * @description
 * Swap two random elements in an array. Both first elements indices are chosen randomly,
 * but the first element in the array will never be involved.
 * Warning: this method has side-effects and the input array will be changed.
 *
 * @param {Array} P A generic array.
 *
 * @return {Array<Vertex>} The same array passed, with two random elements swapped.
 */
function swapRandomPairs(P) {
  const n = P.length;
  // We assume vertex 0 is fixed
  const i = randomInt(1, n);
  const j = randomInt(1, n);
  return swap(P, i, j);
}

/**
 * @name shuffle
 * @private
 * @description
 * Shuffles a portion of (or the whole) array P, using a linear distribution.
 * Warning: this method has side-effects, the input array will be changed.
 *
 * @param {Array<Vertex>} P A permutation of `graph`'s vertices.
 * @param {Number} startIndex The first index in the array to include in the shuffling.
 *                            If omitted, it will be the first element.
 * @param {Number} endIndex The last index in the array to include in the shuffling.
 *                          By default, this is the index of the last element in the array.
 *
 * @return {Array<Vertex>} The same array in input, shuffled.
 */
function shuffle(P, startIndex = 0, endIndex = P.length - 1) {
  for (let i = startIndex; i < endIndex; i++) {
    const j = randomInt(i + 1, endIndex + 1);
    P = swap(P, i, j);
  }
  return P;
}

/**
 * @name swap
 * @private
 * @description
 * Swap two elements in an array.
 * Warning: this method has side-effects and the input array will be changed.
 *
 * @param {Array} P A generic array.
 * @param {Number} i The index of the first element to swap.
 * @param {Number} j The index of the other element to swap.
 *
 * @return {Array} The same array passed, with elements P[i] and P[j] swapped.
 */
function swap(P, i, j) {
  const tmp = P[i];
  P[i] = P[j];
  P[j] = tmp;
  return P;
}

function randomTspStep(P) {
  const choice = Math.random();
  if (choice < 0.1) {
    return swapAdjacentPairs(P);
  } else if (choice < 0.8) {
    return swapRandomPairs(P);
  } else {
    // We don't want the first vertex to be shuffled.
    return shuffle(P, 1);
  }
}