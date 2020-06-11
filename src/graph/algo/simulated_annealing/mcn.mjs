import Graph from "../../graph.mjs";
import Embedding from "../../embedding/embedding.mjs";
import Point2D from "../../../geometric/point2d.mjs";
import { randomDouble, randomInt } from "../../../common/numbers.mjs";
import simulatedAnnealing from "../../../algo/simulated_annealing.mjs";

/**
 * @name minimumIntersectionsEmbedding
 * @description
 * Produces an embedding with the few intersections between graph's edges.
 * It uses simulated annealing optimization technique.
 *
 * @param {Graph} graph The (complete) graph for which we need to find the best tour.
 * @param {Number} maxSteps The maximum number of optimization steps to be performed.
 * @param {Object} options A few optional parameters for the algorithm.
 * @param {Number} options.P0 An optional initial solution. If omitted, the initial point will be chosen randomly.
 * @param {Number} options.T0 Initial temperature of the system. This value must be positive.
 * @param {Number} options.k The Boltzmann constant, used to adjust the acceptance probability of worse solutions.
 *                           This value must be positive.
 * @param {Number} options.alpha The decay rate for the temperature: every 0.1% of the steps, the temperature will be
 *                               updated using the rule T = alpha*T. This must be between 0 and 1 (both excluded).
 * @param {Number} options.width The width of the canvas into which the graph will be embedded.
 * @param {Number} options.height The height of the canvas into which the graph will be embedded.
 * @param {Boolean} options.verbose If true, prints a summary message at each iteration.
 *
 * @return {Embedding} An embedding for the graph.
 */
export default function minimumIntersectionsEmbedding(graph, maxSteps,
  { P0 = null, T0 = 200, k = 0.1, alpha = 0.98, width = 480, height = 480, verbose = false } = {}) {
  if (!(graph instanceof Graph) || graph.isEmpty()) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('tsp', 'graph', graph));
  }
  // NB: width and height will be validated by Embedding.forGraph
  // The other parameters will be validated by method simulatedAnnealing
  if (P0 instanceof Embedding) {
    P0 = P0.clone();
  } else {
    P0 = Embedding.forGraph(graph, { width: width, height: height });
  }
  // Start simulated annealing
  return simulatedAnnealing(crossingNumber, randomStep.bind(null, width, height), maxSteps, P0, T0, k, alpha, verbose);
}

/**
 * @name crossingNumber
 * @private
 * @description
 * Computes the cost of a single solution (a graph embedding) as the number of edges crossing.
 *
 * @param {Embedding} graph The input graph.
 *
 * @return {Number} The number of edges' crossings for the embedding.
 */
function crossingNumber(embedding) {
  return embedding.intersections(true);
}

/**
 * @name
 * @description
 * Performs a random transition, changing current solution into a new candidate.
 *
 * @param {Number} width The width of the drawing area.
 * @param {Number} height The height of the drawing area.
 * @param {Embedding} embedding Current solution.
 */
function randomStep(width, height, embedding) {
  embedding = embedding.clone();
  const vertices = [...embedding.vertices];

  const choice = Math.random();
  if (choice < 0.2) {
    return swapVertices(embedding, vertices);
  } else if (choice < 0.4) {
    return resetVertex(width, height, embedding, vertices);
  } else {
    return updateVertex(width, height, embedding, vertices);
  }
}

/**
 * Chooses a random vertex in an embedding and moves it in small range around its current position.
 */
function updateVertex(width, height, embedding, vertices) {
  const n = vertices.length;
  const v = vertices[randomInt(0, n)];

  const xMultiplier = randomDouble(-0.1, 0.1);
  const yMultiplier = randomDouble(-0.1, 0.1);

  let x = v.position.x + width * xMultiplier;
  x = Math.max(0, Math.min(x, width));
  let y = v.position.y + height * yMultiplier;
  y = Math.max(0, Math.min(y, height));

  embedding.setVertexPosition(v, new Point2D(x, y));
  return embedding;
}

/**
 * Chooses a random vertex and moves it anywhere in the drawing area.
 */
function resetVertex(width, height, embedding, vertices) {
  const n = vertices.length;
  const v = vertices[randomInt(0, n)];

  const x = Math.random() * width;
  const y = Math.random() * height;

  embedding.setVertexPosition(v, new Point2D(x, y));
  return embedding;
}

/**
 * Chooses two random vertices and swap their positions.
 */
function swapVertices(embedding, vertices) {
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
