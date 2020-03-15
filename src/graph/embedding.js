import Graph from './graph.js';
import Point from '../geometric/point.js';

import { ERROR_MSG_COORDINATES_NOT_FOUND, ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_NOT_FOUND } from '../common/errors.js';

class Embedding {
  /**
   * @private
   */
  #graph;

  /**
   * @private
   */
  #coordinates;

  constructor(graph, coordinates) {
    if (!(graph instanceof Graph)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding', 'graph', graph));
    }

    if (!(coordinates instanceof Map)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding', 'coordinates', coordinates));
    }
    for (let v of graph.vertices) {
      if (!coordinates.has(v.label)) {
        throw new Error(ERROR_MSG_COORDINATES_NOT_FOUND('Embedding', v.toString()));
      }
    }    

    this.#coordinates = new Map();
    for (let v in coordinates) {
      if (!graph.hasVertex(v)) {
        throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Embedding', v));
      }
      let cs = coordinates.get(v);
      if (!(cs instanceof Point)) {
        throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding', `coordinates[${v}]`, cs));
      }
      this.#coordinates.set(v, cs);
    }

    this.#graph = graph.clone();
  }

  getVertexCoordinates(vertex) {
    if (!this.#graph.hasVertex(vertex)) {
      throw new ERROR_MSG_VERTEX_NOT_FOUND('GraphEmbedding.getVertexCoordinates()', vertex);
    }
    return this.#coordinates.get(vertex);
  }

  getVertex(vertex) {
    throw new Error("Not implemented");
  }

  getEdge(source, destination) {
    throw new Error("Not implemented");
  }
}

export default Embedding;