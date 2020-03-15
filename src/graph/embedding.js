import Edge from './edge.js';
import Graph from './graph.js';
import Vertex from './vertex.js';

import Point from '../geometric/point.js';
import { isUndefined } from '../common/basic.js';

import { ERROR_MSG_COORDINATES_NOT_FOUND, ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_NOT_FOUND } from '../common/errors.js';
import { consistentStringify } from '../common/strings.js';

export class EmbeddedVertex extends Vertex {
  #coordinates;

  constructor(label, coordinates, { weight } = {}) {
    super(label, { weight: weight });
    if (!(coordinates instanceof Point)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex', 'coordinates', coordinates));
    }
    this.#coordinates = new Point(coordinates);
  }

  get coordinates() {
    return new Point(...coordinates.coordinates());
  }
}

export class EmbeddedEdge extends Edge {
  constructor(source, destination, {weight, label }  = {}) {
    if (!(source instanceof EmbeddedVertex)) {
      throw new ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'source', source);
    }
    if (!(destination instanceof EmbeddedVertex)) {
      throw new ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'destination', destination);
    }
    super(source, destination, {weight, label});
  }

  get sourceCoordinates() {
    return this.source.coordinates;
  }

  get destinationCoordinates() {
    return this.destination.coordinates;
  }
}


class Embedding {
  /**
   * @private
   */
  #graph;

  /**
   * @private
   */
  #vertices;

  static fromJson(json) {

  }

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

    this.#vertices = new Map();
    for (let vertexLabel in coordinates) {
      let v = graph.hasVertex(vertexLabel);
      if (isUndefined(v)) {
        throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Embedding', vertexLabel));
      }
      let cs = coordinates.get(vertexLabel);
      if (!(cs instanceof Point)) {
        throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding', `coordinates[${vertexLabel}]`, cs));
      }
      let eV = new EmbeddedVertex(v.label, cs, { weight: v.weight });
      this.#vertices.set(vertexLabel, eV);
    }

    this.#graph = graph.clone();
  }

  getVertex(vertex) {
    return this.#vertices.get(vertex);
  }

  getEdge(source, destination) {
    let e = this.#graph.getEdge(source, destination);

    let u = this.getVertex(source);
    let v = this.getVertex(destination);

    return new EmbeddedEdge(u, v, {weight: e.weight, label: e.label});
  }

  toJson() {
    return consistentStringify({
      graph: this.#graph,
      coordinates: [...this.#vertices.values()].map(v => v.coordinates);
    })
  }
}

export default Embedding;