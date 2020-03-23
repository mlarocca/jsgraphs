import EmbeddedEdge from './embedded_edge.js';
import EmbeddedVertex from './embedded_vertex.js';
import Graph, { UndirectedGraph } from '../graph.js';
import Point2D from '../../geometric/point2d.js';

import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_NOT_FOUND } from '../../common/errors.js';
import { toNumber, isNumber } from '../../common/numbers.js';
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
      coordinates.set(v.serializedLabel, new Point2D(center + radius * Math.cos(i * delta), center + radius * Math.sin(i * delta)));
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
    let x, y;

    for (const v of g.vertices) {
      const i = toNumber(v.label);
      if (i <= n) {
        x = 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS;
        y = EmbeddedVertex.DEFAULT_VERTEX_RADIUS + (i - 1) * deltaN;
      } else {
        x = canvasSize - 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS;
        y = EmbeddedVertex.DEFAULT_VERTEX_RADIUS + (i - n - 1) * deltaM;
      }
      coordinates.set(v.label, new Point2D(x, y));
    }
    return new Embedding(g, coordinates);
  }

  constructor(graph, coordinates = new Map(), { width, height } = {}) {
    if (!(graph instanceof Graph)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding', 'graph', graph));
    }

    if (!(coordinates instanceof Map)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding', 'coordinates', coordinates));
    }

    this.#vertices = new Map();
    let minX = 0, maxX = 0, minY = 0, maxY = 0;

    for (let v of graph.vertices) {
      let cs = coordinates.get(vertexLabel(v));
      if (!(cs instanceof Point2D)) {
        cs = Point2D.random({ width, height });
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
    return this.#vertices.get(vertexLabel(vertex));
  }

  getEdge(source, destination) {
    let e = this.#graph.getEdge(source, destination);

    let u = this.getVertex(source);
    let v = this.getVertex(destination);

    return new EmbeddedEdge(u, v, { weight: e.weight, label: e.label, isDirected: this.#graph.isDirected() });
  }

  setVertexPosition(vertex, position) {
    const v = this.#vertices.get(vertexLabel(vertex));
    if (v === undefined) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Embedding.setVertexPosition', 'vertex', vertex));
    }
    v.position = position;
  }

  toJson() {
    return JSON.stringify({
      vertices: this.#vertices.values().map(v => v.toJson()),
      edges: [...this.#graph.edges].map(e => e.toJson())
    });
  }

  toSvg(width, height, { graphCssClasses = [], verticesCssClasses = {}, edgesCssClasses = {}, useArcs = false }) {
    return `
  <svg width="${width}" height="${height}">
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" markerUnits="userSpaceOnUse" refX="7" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" style="fill:var(--color-arrow)"/>
      </marker>
      <linearGradient id="linear-shape-gradient" x2="0.35" y2="1">
        <stop offset="0%" stop-color="var(--color-stop)" />
        <stop offset="30%" stop-color="var(--color-stop)" />
        <stop offset="100%" stop-color="var(--color-bot)" />
      </linearGradient>
      <radialGradient id="radial-shape-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stop-color="var(--color-inner)" style="stop-opacity:1" />
        <stop offset="100%" stop-color="var(--color-outer)" style="stop-opacity:1" />
      </radialGradient>
    </defs>
    <g class="graph ${graphCssClasses.join(" ")}">
      <g class="edges">${[...this.edges].map(e => {
        let css = [...(verticesCssClasses[e.source.serializedLabel] || []), ...(verticesCssClasses[e.destination.serializedLabel] || [])];
        return this.getEdge(e.source, e.destination).toSvg({ cssClasses: css, useArcs: useArcs });
      }).join('')}</g>
    <g class="vertices">${[...this.vertices].map(v => v.toSvg(verticesCssClasses[v.serializedLabel])).join('')}</g>
    </g>
  </svg>`;
  }
}

function vertexLabel(vertex) {
  if (vertex instanceof Vertex) {
    return vertex.serializedLabel;
  } else {
    return Vertex.serializeLabel(vertex);
  }
}
export default Embedding;