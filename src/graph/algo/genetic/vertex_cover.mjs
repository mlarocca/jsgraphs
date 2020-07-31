import Graph from "../../graph.mjs";
import { randomBoolean, randomInt } from "../../../common/numbers.mjs";
import { default as geneticAlgorithm, Crossover, Mutation } from "../../../algo/genetic_algorithm.mjs";
import { ERROR_MSG_INVALID_ARGUMENT } from "../../../common/errors.mjs";

/**
 * @name vertexCover
 * @description
 * Solve the vertex cover problem using simulated annealing optimization.
 *
 * @param {Graph} graph The (complete) graph for which we need to find the best tour.
 * @param {Number} maxSteps The number of evolutionary steps that the population will undergo.
 * @param {Object} options A few optional parameters for the algorithm.
 * @param {Number} options.crossoverChance The probability (as a ratio r, 0 <= r <= 1) that, during each evolutionary step,
 *                                        once selected 2 organisms, a new organism will be created as a crossover of its
 *                                        two parents. Mating between the two parents is randomly selected, otherwise
 *                                        the algorithm will just select one of them to advance to next generation.
 *                                        The choice of the elements for mating is based on tournament selection.
 * @param {Number} options.mutation1Chance The probability that the 1st kind of mutation (flipping a single bit)
 *                                        will be applied.
 * @param {Number} options.populationSize The number of simulated organism that will be used.
 * @param {Boolean} options.verbose If true, prints a summary message at each iteration.
 *
 * @return {Object} A POJO with two fields:
 *  - solution: The vertex permutation corresponding to the optimum found by the algorithm (not guaranteed to be optimal);
 *  - cost: The sum of the edges in the best tour found.
 */
export default function vertexCover(graph, maxSteps,
  { populationSize = 50, crossoverChance = 0.2, mutation1Chance = 0.01, verbose = false } = {}) {
  if (!(graph instanceof Graph) || graph.isEmpty()) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('vertexCover', 'graph', graph));
  }
  // NB: The other parameters will be validated by method geneticAlgorithm
  // Choose an initial solution, keeping the initial vertex fixed
  // Prepare GA operators
  const crossover = new Crossover(mergeChromosomes, crossoverChance);
  // Mutation 1 is applied to single genes, so it needs to use the mutation chance internally to randomly decide
  // which genes should be affected, while the mutation operator needs to be applied to all organisms.
  const mutation1 = new Mutation(flipBits.bind(null, mutation1Chance), 1.0);

  const fitness = vertexCoverFitness.bind(null, graph.edges, vertexToIndex(graph));
  // Start simulated annealing
  const solution = geneticAlgorithm(
    fitness,
    crossover, [mutation1], randomSolution.bind(null, graph.vertices.length),
    populationSize, maxSteps, (P) => P.slice(0), verbose);  // Start simulated annealing
    return { solution: solution, cost: fitness(solution) };
}

/**
 * @name vertexToIndex
 * @description
 * Creates a Map from vertex IDs to their indices in the chromosome.
 *
 * @param {Graph} graph The input graph.
 * @returns {Object} A POJO dictionary between strings (the IDs) and indices.
 */
function vertexToIndex(graph) {
  let i = 0;
  let vMap = {};

  for (let v of graph.vertices) {
    vMap[v.id] = i;
    i+=1;
  }

  return vMap;
}

/**
 * @name vertexCoverFitness
 * @private
 * @description
 * Computes the cost of a single solution (a permutation of the vertices) for the TSP on a given graph.
 *
 * @param {Array<Edge>} edges A list of graph's edges.
 * @param {Object} vertexToIndex A map between the graph's vertices and their indices in the chromosome.
 * @param {Array<Vertex>} chromosome A permutation of `graph`'s vertices.
 *
 * @return {Number} The cost of current solution: the number of vertices used, plus a constant for each edge not covered.
 */
function vertexCoverFitness(edges, vertexToIndex, chromosome) {
  let totalCost = chromosome.reduce((tot, bit) => tot + bit, 0);

  for (let e of edges) {
    const sourceIndex = vertexToIndex[e.source.id];
    const destinationIndex = vertexToIndex[e.destination.id];
    if (!(chromosome[sourceIndex] || chromosome[destinationIndex])) {
      // The cost for any uncovered edge must be more than 1
      totalCost += 3;
    }
  }
  return totalCost;
}

/**
 * @name randomSolution
 *
 * @param {Number} numberOfVertices How many vertices there are in the graph.
 * @return {Array<Boolean>} A chromosome, a list of 1 bit per graph's vertex.
 */
function randomSolution(numberOfVertices) {
  let chromosome = [];
  for (let _ = 0; _ < numberOfVertices; _++) {
    // For each vertex, randomly flip a coin to decide if it's going to be in the cover or not.
    chromosome.push(randomBoolean());
  }
  return chromosome;
}

/**
 * Merge two chromosomes for this problem.
 *
 * @param {Array<Boolean>} chromosome1 The first chromosome.
 * @param {Array<Boolean>} chromosome2 The second chromosome.
 */
function mergeChromosomes(chromosome1, chromosome2) {
  const n = chromosome1.length;
  const elementsFromChromosome1 = randomInt(1, n); // Between 1 and n-1 included

  const newChromosome = chromosome1.slice(0, elementsFromChromosome1);

  for (let i = elementsFromChromosome1; i < n; i++) {
    newChromosome.push(chromosome2[i]);
  }

  return newChromosome;
}

/**
 * @name flipBits
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
function flipBits(flipChance, chromosome) {
  const n = chromosome.length;
  // We assume vertex 0 is fixed
  for (let i = 0; i < n; i++) {
    if (Math.random() < flipChance) {
      chromosome[i] = ! chromosome[i];
    }
  }
  return chromosome;
}