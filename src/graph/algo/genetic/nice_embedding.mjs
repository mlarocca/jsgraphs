import Graph from "../../graph.mjs";
import Embedding from "../../embedding/embedding.mjs";
import Point2D from "../../../geometric/point2d.mjs";
import { isNumber, randomInt, toNumber } from "../../../common/numbers.mjs";
import { default as geneticAlgorithm, Crossover, Mutation } from "../../../algo/genetic_algorithm.mjs";

/**
 * @name niceEmbedding
 * @description
 * Produces an embedding loosely inspired by force-directed drawing, based on the paper:
 * "Ron Davidson and David Harel.
 *  Drawing graphs nicely using simulated annealing. ACM Transactions on Graphics, 15(4):301–331, 1996."
 *
 * @param {Graph} graph The (complete) graph for which we need to find the best tour.
 * @param {Number} maxSteps The maximum number of optimization steps to be performed.
 * @param {Number} populationSize The number of individuals in the population to evolve using GA.
 * @param {Number} lambda1 Controls the weight of the repulsive force between the border of the canvas and the vertices.
 *                         Higher values push the vertices towards the center of the canvas.
 * @param {Number} lambda2 Controls the weight of the attractive force between vertices in the cost function.
 *                         Higher values keep the vertices close together.
 * @param {Number} lambda3 Controls the weight of the edges length in the cost function.
 *                         Higher values push for shorter edges.
 * @param {Number} lambda4 Controls the weight of the number of intersections in the cost function.
 *                         Higher values penalize intersections more.
 * @param {Object} options A few optional parameters for the algorithm.
 * @param {Number} crossoverRatio The probability (as a ratio r, 0 <= r <= 1) that, during each evolutionary step,
  *                               once selected 2 organisms, a new organism will be created as a crossover of its
  *                               two parents. Mating between the two parents is randomly selected, otherwise
  *                               the algorithm will just select one of them to advance to next generation.
  *                               The choice of the elements for mating is based on tournament selection.
 * @param {Number} mutation1Ratio The probability that the 1st kind of mutation will be applied.
 * @param {Number} mutation2Ratio The probability that the 2nd kind of mutation will be applied.
 * @param {Number} mutation3Ratio The probability that the 3rd kind of mutation will be applied.
 * @param {Number} options.width The width of the canvas into which the graph will be embedded.
 * @param {Number} options.height The height of the canvas into which the graph will be embedded.
 * @param {Boolean} options.verbose If true, prints a summary message at each iteration.
 *
 * @return {Embedding} An embedding for the graph.
 */
export default function niceEmbedding(graph, maxSteps,
  lambda1, lambda2, lambda3, lambda4,
  { populationSize = 50, crossoverRatio = 0.7, mutation1Ratio = 0.1, mutation2Ratio = 0.2, mutation3Ratio = 0.7,
    width = 480, height = 480, verbose = false } = {}) {
  if (!(graph instanceof Graph) || graph.isEmpty()) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('niceEmbedding', 'graph', graph));
  }
  // Check lambda parameters (the normalization factors) and make sure they are converted to number type.
  [lambda1, lambda2, lambda3, lambda4] = validate(lambda1, lambda2, lambda3, lambda4);

  // NB: width and height will be validated by Embedding.forGraph
  // The other parameters will be validated by method geneticAlgorithm

  // Prepare GA operators
  const crossover = new Crossover(mergeEmbeddings, crossoverRatio);
  const mutation1 = new Mutation(swapVertices, mutation1Ratio);
  const mutation2 = new Mutation(resetVertex.bind(null, width, height), mutation2Ratio);
  const mutation3 = new Mutation(updateVertex.bind(null, width, height), mutation3Ratio);

  // Start simulated annealing
  return geneticAlgorithm(
    costFunction.bind(null, width, height, lambda1, lambda2, lambda3, lambda4),
    crossover, [mutation1, mutation2, mutation3], randomEmbedding.bind(null, graph, width, height),
    populationSize, maxSteps, undefined, verbose);
}

/**
 * @name costFunction
 * @private
 * @description
 * Computes the cost of a single solution (a graph embedding) as the number of edges crossing.
 *
 * @param {Embedding} graph The input graph.
 *
 * @return {Number} The number of edges' crossings for the embedding.
 */
function costFunction(width, height, lambda1, lambda2, lambda3, lambda4, embedding) {
  let total = 0;
  const vertices = [...embedding.vertices];
  const n = vertices.length;
  for (let i = 0; i < n - 1; i++) {
    const v = vertices[i];
    const x = v.position.x;
    const y = v.position.y;
    const dx = width - x;
    const dy = height - y;
    // Repulsive forces from the border
    total += lambda2 * (1 / (x * x) + 1 / (y * y) + 1 / (dx * dx) + 1 / (dy * dy));

    for (let j = i + 1; j < n; j++) {
      // Repulsive force between vertices
      const u = vertices[j];
      const distance = v.position.distanceTo(u.position);
      total += 2 * lambda1 / (distance * distance);
    }
  }

  // Attractive force caused by edges
  for (const e of embedding.edges) {
    if (e.isLoop()) {
      continue;
    }
    const distance = e.source.position.distanceTo(e.destination.position);
    total += lambda3 * distance * distance;
  }

  // Edge crossing penalty
  total += lambda4 * embedding.intersections();

  return total;
}


function randomEmbedding(graph, width, height) {
  return Embedding.forGraph(graph, { width: width, height: height });
}

function mergeEmbeddings(embedding1, embedding2) {
  const vertices = [...embedding2.vertices];
  const n = vertices.length;
  const crossoverPoint = randomInt(0, n - 1); // Between 0 and n-2 included

  const newEmbedding = embedding1.clone();
  for (let i = crossoverPoint + 1; i < n; i++) {
    const v = vertices[i];
    newEmbedding.setVertexPosition(v, v.position);
  }

  return newEmbedding;
}

/**
 * Chooses a random vertex in an embedding and moves it in small range around its current position.
 */
function updateVertex(width, height, embedding) {
  const vertices = [...embedding.vertices];
  const n = vertices.length;
  const v = vertices[randomInt(0, n)];

  // Make sure both 1 <= x <= width-1 and 1 <= y <= height-1 to avoid edge cases
  let x = v.position.x + randomInt(0, width/2);
  x = Math.max(1, Math.min(x, width - 1));
  let y = v.position.y + randomInt(0, height/2);
  y = Math.max(1, Math.min(y, height - 1));

  embedding.setVertexPosition(v, new Point2D(x, y));
  return embedding;
}

/**
 * Chooses a random vertex and moves it anywhere in the drawing area.
 */
function resetVertex(width, height, embedding) {
  const vertices = [...embedding.vertices];
  const n = vertices.length;
  const v = vertices[randomInt(0, n)];
  // Avoid borders
  const x = randomInt(1, width);
  const y = randomInt(1, height);

  embedding.setVertexPosition(v, new Point2D(x, y));
  return embedding;
}

/**
 * Chooses two random vertices and swap their positions.
 */
function swapVertices(embedding) {
  const vertices = [...embedding.vertices];
  const n = vertices.length;
  const v = vertices[randomInt(0, n)];
  const u = vertices[randomInt(0, n)];

  if (!v.equals(u)) {
    const vPos = v.position;
    embedding.setVertexPosition(v, u.position);
    embedding.setVertexPosition(u, vPos);
  }
  return embedding
}

function validate(lambda1, lambda2, lambda3, lambda4) {
  if (!isNumber(lambda1)) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('niceEmbedding', 'lambda1', lambda1));
  }
  if (!isNumber(lambda2)) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('niceEmbedding', 'lambda2', lambda2));
  }
  if (!isNumber(lambda3)) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('niceEmbedding', 'lambda3', lambda3));
  }
  if (!isNumber(lambda4)) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('niceEmbedding', 'lambda4', lambda4));
  }

  return [lambda1, lambda2, lambda3, lambda4].map(maybeNum => toNumber(maybeNum));
}