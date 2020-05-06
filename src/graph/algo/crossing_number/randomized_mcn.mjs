import Embedding from "../../embedding/embedding.mjs";
import Graph from "../../graph.mjs";
import { ERROR_MSG_INVALID_ARGUMENT } from "../../../common/errors.mjs";
import { isNumber, range } from "../../../common/numbers.mjs";
import { toNumber } from "../../../common/numbers.mjs";

export function minimumIntersectionsEmbedding(graph, runs, {width = 480, height = 480} = {}) {
  if (!(graph instanceof Graph) || graph.isEmpty()) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'graph', graph));
  }
  if (!isNumber(runs) || runs <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'runs', runs));
  }
  if (!isNumber(width) || width <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'width', width));
  }
  if (!isNumber(height) || height <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('minimumIntersectionsEmbedding', 'height', height));
  }
  // makes sure the arguments are converted to numbers.
  runs = toNumber(runs);
  width = toNumber(width);
  height = toNumber(height);
  let bestIntersectionsNumber = Number.MAX_SAFE_INTEGER;
  let bestEmbedding = null;

  range(0, runs).forEach(_ => {
    const emb = Embedding.forGraph(graph, {width: width, height: height});
    const intersections = emb.rectilinearIntersections();
    if (intersections < bestIntersectionsNumber) {
      bestIntersectionsNumber = intersections;
      bestEmbedding = emb;
    }
  });
  return bestEmbedding;
}