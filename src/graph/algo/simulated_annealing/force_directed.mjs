import Graph from "../../graph.mjs";
import Embedding from "../../embedding/embedding.mjs";
import Point2D from "../../../geometric/point2d.mjs";
import { randomDouble, randomInt } from "../../../common/numbers.mjs";
import simulatedAnnealing from "./simulated_annealing.mjs";

/**
 * @name forceDirectedEmbedding
 * @description
 * Produces an embedding based on force-directed drawing.
 *
 * @param {Graph} graph The (complete) graph for which we need to find the best tour.
 * @param {Number} maxSteps The maximum number of optimization steps to be performed.
 * @param {Number} lambda1 Controls the weight of the repulsive force between the border of the canvas and the vertices.
 *                         Higher values push the vertices towards the center of the canvas.
 * @param {Number} lambda2 Controls the weight of the attractive force between vertices in the cost function.
 *                         Higher values keep the vertices close together.
 * @param {Number} lambda3 Controls the weight of the edges length in the cost function.
 *                         Higher values push for shorter edges.
 * @param {Number} lambda4 Controls the weight of the number of intersections in the cost function.
 *                         Higher values penalize intersections more.
 * @param {Number} T0 Initial temperature of the system. This value must be positive.
 * @param {Number} k The Boltzmann constant, used to adjust the acceptance probability of worse solutions. This value must be positive.
 * @param {Number} alpha The decay rate for the temperature: every 0.1% of the steps, the temperature will be update using the rule T = alpha*T.
 *                       This must be between 0 and 1 (both excluded).
 * @param {Number} width The width of the canvas into which the graph will be embedded.
 * @param {Number} height The height of the canvas into which the graph will be embedded.
 * @param {Boolean} verbose If true, prints a summary message at each iteration.
 *
 * @return {Embedding} An embedding for the graph.
 */
export default function forceDirectedEmbedding(graph, maxSteps, lambda1, lambda2, lambda3, lambda4,
  { T0 = 1000, k = 1e9, alpha = 0.9, width = 480, height = 480, verbose = false } = {}) {
  if (!(graph instanceof Graph) || graph.isEmpty()) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('tsp', 'graph', graph));
  }
  const desiredEdgeLength = Math.sqrt(width * height / graph.vertices.length);
  // NB: width and height will be validated by Embedding.forGraph
  // The other parameters will be validated by method simulatedAnnealing

  const P0 = Embedding.forGraph(graph, { width: width, height: height });
  // Start simulated annealing
  return simulatedAnnealing(costFunction.bind(null, width, height, lambda1, lambda2, lambda3, lambda4),
    randomStep.bind(null, width, height), maxSteps, P0, T0, k, alpha, verbose);
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
  if (choice < 0.1) {
    return swapVertices(embedding, vertices);
  } else if (choice < 0.2) {
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
