import Embedding from "../../embedding/embedding.mjs";
import Graph from "../../graph.mjs";
import { isNumber, range, toNumber } from "../../../common/numbers.mjs";
import { ERROR_MSG_INVALID_ARGUMENT } from "../../../common/errors.mjs";

/**
 * @name minimumIntersectionsEmbedding
 * @description
 * Random sampling algorithm for the minimum rectilinear intersections embedding.
 *
 * @param {Graph} graph The graph to embedd.
 * @param {Number} maxSteps Maximum number of random samples attempted.
 * @param {Number} width Width of the drawing area where the graph will be embedded.
 * @param {Number} height Height of the drawing area where the graph will be embedded.
 * @param {Boolean} verbose If true, prints a summary message at each iteration.
 *
 * @return {Embedding} An embedding for the graph in a rectangular region of size width * height.
 */
export default function minimumIntersectionsEmbedding(graph, maxSteps, width = 480, height = 480, verbose = false) {
  if (!(graph instanceof Graph) || graph.isEmpty()) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'graph', graph));
  }
  if (!isNumber(maxSteps) || toNumber(maxSteps) <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'runs', maxSteps));
  }
  if (!isNumber(width) || toNumber(width) <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'width', width));
  }
  if (!isNumber(height) || toNumber(height) <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'height', height));
  }
  // makes sure the arguments are converted to numbers.
  maxSteps = toNumber(maxSteps);
  width = toNumber(width);
  height = toNumber(height);
  let bestIntersectionsNumber = Number.MAX_SAFE_INTEGER;
  let bestEmbedding = null;

  range(0, maxSteps).forEach(i => {
    const emb = Embedding.forGraph(graph, { width: width, height: height });
    const intersections = emb.intersections();
    if (intersections < bestIntersectionsNumber) {
      bestIntersectionsNumber = intersections;
      bestEmbedding = emb;
    }
    if (verbose) {
      console.log(`It. ${i} | Best ${bestIntersectionsNumber}`)
    }
  });
  return bestEmbedding;
}