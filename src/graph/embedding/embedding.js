import EmbeddedEdge from './embedded_edge.js';
import EmbeddedVertex from './embedded_vertex.js';
import Graph, { UndirectedGraph } from '../graph.js';

import Point from '../../geometric/point.js';
import { isUndefined } from '../../common/basic.js';

import { ERROR_MSG_COORDINATES_NOT_FOUND, ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_NOT_FOUND } from '../../common/errors.js';
import { toNumber, isNumber } from '../../common/numbers.js';
import Point2D from '../../geometric/point2d.js';
import Vertex from '../vertex.js';

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

  static completeGraph(n, canvasSize) {
    if (!isNumber(n) || n < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeGraph', 'n', n));
    }

    if (!isNumber(canvasSize) || canvasSize <= 0) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeGraph', 'canvasSize', canvasSize));
    }

    const g = UndirectedGraph.completeGraph(n);

    let coordinates = new Map();
    for (const v of g.vertices) {
      const i = toNumber(v.label) - 1;
      const delta = 2 * Math.PI / n;
      const center = canvasSize / 2;
      const radius = center - EmbeddedVertex.DEFAULT_VERTEX_RADIUS;
      coordinates.set(v.label, new Point2D(center + radius * Math.cos(i * delta), center + radius * Math.sin(i * delta)));
    }
    return new Embedding(g, coordinates);
  }

  static completeBipartiteGraph(n, m, canvasSize) {
    if (!isNumber(n) || n < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeBipartiteGraph', 'n', n));
    }

    if (!isNumber(m) || m < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeBipartiteGraph', 'm', m));
    }

    if (!isNumber(canvasSize) || canvasSize <= 0) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeBipartiteGraph', 'canvasSize', canvasSize));
    }

    const g = UndirectedGraph.completeBipartiteGraph(n, m);

    const deltaN = (canvasSize - 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS) / (n - 1);
    const deltaM = (canvasSize - 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS) / (m - 1);
    let coordinates = new Map();
    let x,y;

    for (const v of g.vertices) {
      const i = toNumber(v.label);
      if (i <= n) {
        x = 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS;
        y = EmbeddedVertex.DEFAULT_VERTEX_RADIUS + (i - 1) * deltaN;
      } else {
        x = canvasSize - 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS;
        y = EmbeddedVertex.DEFAULT_VERTEX_RADIUS + (i - n - 1) * deltaM;
      }
      coordinates.set(v.label, new Point2D(x,y));
    }
    return new Embedding(g, coordinates);
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
    let minX = 0, maxX = 0, minY = 0, maxY = 0;

    for (let vertexLabel of coordinates.keys()) {
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
    return this.#vertices.values();
  }

  get edges() {
    return this.#graph.edges;
  }

  getVertex(vertex) {
    return this.#vertices.get(vertex.serializedLabel);
  }

  getEdge(source, destination) {
    let e = this.#graph.getEdge(source, destination);

    let u = this.getVertex(source);
    let v = this.getVertex(destination);

    return new EmbeddedEdge(u, v, { weight: e.weight, label: e.label, isDirected: this.#graph.isDirected() });
  }

  toJson() {
    return JSON.stringify({
      vertices: this.#vertices.values().map(v => v.toJson()),
      edges: [...this.#graph.edges].map(e => e.toJson())
    });
  }

  toSvg(width, height, cssClasses = {}) {
    return `
  <svg width="${width}" height="${height}">
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="7" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" />
      </marker>
    </defs>
    <g class="graph">
      <g class="edges">${[...this.edges].map(e => {
      let css = [...(cssClasses[e.source.serializedLabel] || []), ...(cssClasses[e.destination.serializedLabel] || [])];
      return this.getEdge(e.source, e.destination).toSvg(css);
    }).join('')}</g>
      <g class="vertices">${[...this.vertices].map(v => v.toSvg(cssClasses[v.serializedLabel])).join('')}</g>
    </g>
  </svg>`;
  }
}

export default Embedding;