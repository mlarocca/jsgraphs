import Graph from './graph.js';

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
    this.#graph = graph;
    this.#coordinates = coordinates;
  }

  getVertexCoordinates(vertex) {
    if (!this.#graph.hasVertex(vertex)) {
      throw new ERROR_MSG_VERTEX_NOT_FOUND('GraphEmbedding.getVertexCoordinates()', vertex);
    }
    return this.#coordinates.get(vertex);
  }

  getEdgeWeight(source, destination) {

  }

  
}

export default Embedding;