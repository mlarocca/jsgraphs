import EmbeddedEdge from './embedded_edge.js';
import EmbeddedVertex from './embedded_vertex.js';
import Graph from '../graph.js';

import Point from '../../geometric/point.js';
import { isUndefined } from '../../common/basic.js';

import { ERROR_MSG_COORDINATES_NOT_FOUND, ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_NOT_FOUND } from '../../common/errors.js';

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
      let v = graph.getVertex(vertexLabel);
      if (isUndefined(v)) {
        throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Embedding', vertexLabel));
      }
      let cs = coordinates.get(vertexLabel);
      if (!(cs instanceof Point)) {
        throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding', `coordinates[${vertexLabel}]`, cs));
      }
      let eV = new EmbeddedVertex(v.label, cs, { weight: v.weight });
      this.#vertices.set(v.serializedLabel, eV);
    }

    this.#graph = graph.clone();
  }

  get vertices() {

  }

  get edges() {

  }

  getVertex(vertex) {
    return this.#vertices.get(vertex);
  }

  getEdge(source, destination) {
    let e = this.#graph.getEdge(source, destination);

    let u = this.getVertex(source);
    let v = this.getVertex(destination);

    return new EmbeddedEdge(u, v, { weight: e.weight, label: e.label });
  }

  toJson() {
    return JSON.stringify({
      vertices: this.#vertices.values().map(v => v.toJson()),
      edges: [...this.#graph.edges].map(e => e.toJson())
    });
  }

  toSvg(vertexRadius = EmbeddedVertex.DEFAULT_VERTEX_RADIUS) {
    return `
    <svg>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="7" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      <g class="graph">
        <g class="edges">${[...this.#graph.edges].map(e => this.getEdge(e.source, e.destination).toSvg(vertexRadius))}</g>
        <g class="vertices">${this.#vertices.values().map(v => v.toSvg(vertexRadius))}</g>
      </g>
    </svg>`;
  }
}

export default Embedding;