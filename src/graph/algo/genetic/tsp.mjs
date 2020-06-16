import Graph from "../../graph.mjs";
import { randomInt } from "../../../common/numbers.mjs";
import { default as geneticAlgorithm, Crossover, Mutation } from "../../../algo/genetic_algorithm.mjs";

/**
 * @name tsp
 * @description
 * Solve the tsp problem using simulated annealing optimization.
 *
 * @param {Graph} graph The (complete) graph for which we need to find the best tour.
 * @param {Number} maxSteps The number of evolutionary steps that the population will undergo.
 * @param {Object} options A few optional parameters for the algorithm.
 * @param {Number} options.crossoverRatio The probability (as a ratio r, 0 <= r <= 1) that, during each evolutionary step,
 *                                        once selected 2 organisms, a new organism will be created as a crossover of its
 *                                        two parents. Mating between the two parents is randomly selected, otherwise
 *                                        the algorithm will just select one of them to advance to next generation.
 *                                        The choice of the elements for mating is based on tournament selection.
 * @param {Number} options.mutation1Ratio The probability that the 1st kind of mutation will be applied.
 * @param {Number} options.mutation2Ratio The probability that the 2nd kind of  mutation will be applied.
 * @param {Number} options.populationSize The number of simulated organism that will be used.
 * @param {Boolean} options.verbose If true, prints a summary message at each iteration.
 *
 * @return {Object} A POJO with two fields:
 *  - solution: The vertex permutation corresponding to the optimum found by the algorithm (not guaranteed to be optimal);
 *  - cost: The sum of the edges in the best tour found.
 */
export default function tsp(graph, maxSteps,
  { populationSize = 50, crossoverRatio = 0.2, mutation1Ratio = 0.1, mutation2Ratio = 0.5, verbose = false } = {}) {
  if (!(graph instanceof Graph) || graph.isEmpty()) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('tsp', 'graph', graph));
  }
  // NB: The other parameters will be validated by method geneticAlgorithm
  // Choose an initial solution, keeping the initial vertex fixed
  // Prepare GA operators
  const crossover = new Crossover(mergeTours, crossoverRatio);
  const mutation1 = new Mutation(swapAdjacentPairs, mutation1Ratio);
  const mutation2 = new Mutation(swapRandomPairs, mutation2Ratio);
  // const mutation3 = new Mutation(updateVertex.bind(null, width, height), mutation3Ratio);

  // Start simulated annealing
  const solution = geneticAlgorithm(
    tspTourCost.bind(null, graph),
    crossover, [mutation1, mutation2], randomSolution.bind(null, graph),
    populationSize, maxSteps, (P) => P.slice(0), verbose);  // Start simulated annealing
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

function randomSolution(graph) {
  return shuffle(graph.vertices, 1);
}

function mergeTours(tour1, tour2) {
  const n = tour1.length;
  const crossoverPoint = randomInt(1, n); // Between 0 and n-2 included

  const newTour = tour1.slice(0, crossoverPoint);
  let tourSet = new Set(newTour);

  for (let i = 0; i < n; i++) {
    if (!tourSet.has(tour2[i])) {
      newTour.push(tour2[i]);
    }
  }

  return newTour;
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
  // Must make a copy first
  P = P.slice(0);
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