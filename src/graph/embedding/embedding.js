import EmbeddedEdge from './embedded_edge.js';
import EmbeddedVertex from './embedded_vertex.js';

import Graph, { UndirectedGraph } from '../graph.js';
import Vertex from '../vertex.js';
import Edge from '../edge.js';

import Point2D from '../../geometric/point2d.js';

import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_NOT_FOUND, ERROR_MSG_EDGE_NOT_FOUND } from '../../common/errors.js';
import { toNumber, isNumber } from '../../common/numbers.js';
import { isUndefined, isPlainObject } from '../../common/basic.js';

class Embedding {
  /**
   * @private
   */
  #vertices;

  /**
   *
   * @param {*} json
   *
   */
  #edges;

  // -----  CLASS METHODS  -----

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

    let coordinates = {};
    for (const v of g.vertices) {
      const i = toNumber(v.label) - 1;
      const delta = 2 * Math.PI / n;
      const center = canvasSize / 2;
      const radius = center - EmbeddedVertex.DEFAULT_VERTEX_RADIUS;
      coordinates[v.id] = new Point2D(center + radius * Math.cos(i * delta), center + radius * Math.sin(i * delta));
    }
    return new Embedding(g, {coordinates: coordinates});
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
    let coordinates = {};
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
      coordinates[v.id] = new Point2D(x, y);
    }
    return new Embedding(g, {coordinates: coordinates});
  }

  // -----  INSTANCE METHODS  -----

  constructor(graph, { width, height, coordinates = {} } = {}) {
    if (!(graph instanceof Graph)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding', 'graph', graph));
    }

    if (!isPlainObject(coordinates)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding', 'coordinates', coordinates));
    }

    this.#vertices = new Map();
    this.#edges = new Map();

    for (const v of graph.vertices) {
      let cs = coordinates[vertexLabel(v)];
      if (!(cs instanceof Point2D)) {
        cs = Point2D.random({ width, height });
      }
      let eV = new EmbeddedVertex(v.label, cs, { weight: v.weight });
      this.#vertices.set(v.id, eV);
    }

    for (const e of graph.edges) {
      const ee = new EmbeddedEdge(
        this.getVertex(e.source),
        this.getVertex(e.destination),
        { weight: e.weight, label: e.label, isDirected: graph.isDirected() });
      this.#edges.set(ee.id, ee);
    }
  }

  get vertices() {
    return this.#vertices.values();
  }

  get edges() {
    return this.#edges.values();
  }

  getVertex(vertex) {
    return this.#vertices.get(vertexLabel(vertex));
  }

  getEdge(edge) {
    return this.#edges.get(edgeLabel(edge));
  }

  /**
   *
   * @param {*} vertex
   * @param {*} position
   */
  setVertexPosition(vertex, position) {
    const v = this.#vertices.get(vertexLabel(vertex));
    if (isUndefined(v)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Embedding.setVertexPosition', 'vertex', vertex));
    }
    if (!(position instanceof Point2D)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Embedding.setVertexPosition', 'position', position));
    }
    v.position = position;
  }

  /**
   *
   * @param {*} edge
   * @param {Number} arcControlDistance The distance of the control point of the Bezier quadratic curve used to display the edge.
   */
  setEdgeControlPoint(edge, arcControlDistance) {
    const e = this.#edges.get(edgeLabel(edge));
    if (isUndefined(e)) {
      throw new Error(ERROR_MSG_EDGE_NOT_FOUND('Embedding.setEdgeControlPoint', 'edge', edge));
    }
    if (!isNumber(arcControlDistance)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Embedding.setEdgeControlPoint', 'arcControlDistance', arcControlDistance));
    }
    e.arcControlDistance = arcControlDistance;
  }

  toJson() {
    return JSON.stringify({
      vertices: [...this.vertices].map(v => v.toJson()),
      edges: [...this.edges].map(e => e.toJson())
    });
  }

  /**
   *
   * @param {*} width
   * @param {*} height
   * @param {*} options
   */
  toSvg(width, height,
    {
      drawEdgesAsArcs = false,
      displayEdgesLabel = true,
      displayEdgesWeight = true,
      graphCss = [],
      verticesCss = {},
      edgesCss = {}
    } = {}) {
    return `
<svg width="${width}" height="${height}">
  ${svgDefs()}
  <g class="graph ${graphCss.join(' ')}">
    <g class="edges">${[...this.edges].map(e => {
      return e.toSvg({
        cssClasses: edgesCss[e.id],
        drawAsArc: drawEdgesAsArcs,
        displayLabel: displayEdgesLabel,
        displayWeight: displayEdgesWeight
      });
    }).join('')}
    </g>
  <g class="vertices">${[...this.vertices].map(v => v.toSvg(verticesCss[v.id])).join('')}</g>
  </g>
</svg>`;
  }
}

/**
 * @private
 * @param {Vertex?} vertex
 */
function vertexLabel(vertex) {
  if (vertex instanceof Vertex) {
    return vertex.id;
  } else {
    return Vertex.serializeLabel(vertex);
  }
}

/**
 * @private
 * @param {Edge?} edge
 */
function edgeLabel(edge) {
  if (edge instanceof Edge) {
    return edge.id;
  } else {
    return edge;
  }
}
/**
 *
 */
function svgDefs() {
  return `
  <defs>
    <marker id="arrowhead" markerWidth="14" markerHeight="12" markerUnits="userSpaceOnUse" refX="13" refY="6" orient="auto">
      <polygon points="0 0, 14 6, 0 12" style="fill:var(--color-arrow)"/>
    </marker>
    <linearGradient id="linear-shape-gradient" x2="0.35" y2="1">
      <stop offset="0%" stop-color="var(--color-stop)" />
      <stop offset="30%" stop-color="var(--color-stop)" />
      <stop offset="100%" stop-color="var(--color-bot)" />
    </linearGradient>
    <radialGradient id="radial-shape-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="var(--color-inner)" style="stop-opacity:1" />
      <stop offset="50%" stop-color="var(--color-mid)" style="stop-opacity:1" />
      <stop offset="100%" stop-color="var(--color-outer)" style="stop-opacity:1" />
    </radialGradient>
  </defs>`;
}


export default Embedding;