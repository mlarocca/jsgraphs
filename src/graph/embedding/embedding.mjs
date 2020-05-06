import EmbeddedEdge from './embedded_edge.mjs';
import EmbeddedVertex from './embedded_vertex.mjs';

import Graph, { UndirectedGraph } from '../graph.mjs';
import Vertex from '../vertex.mjs';
import Edge from '../edge.mjs';

import Point2D from '../../geometric/point2d.mjs';

import { ERROR_MSG_INVALID_ARGUMENT, ERROR_MSG_VERTEX_NOT_FOUND, ERROR_MSG_EDGE_NOT_FOUND } from '../../common/errors.mjs';
import { isUndefined, isPlainObject, isIterable } from '../../common/basic.mjs';
import { toNumber, isNumber } from '../../common/numbers.mjs';
import { consistentStringify } from '../../common/strings.mjs';

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
    return Embedding.fromJsonObject(JSON.parse(json))
  }

  static fromJsonObject({ vertices, edges }) {
    return new Embedding(vertices.map(v => EmbeddedVertex.fromJson(v)), edges.map(e => EmbeddedEdge.fromJson(e)));
  }

  static forGraph(graph, { width, height, vertexCoordinates = {}, edgeArcControlDistances = {} } = {}) {
    if (!(graph instanceof Graph)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding:fromGraph', 'graph', graph));
    }

    if (!isPlainObject(vertexCoordinates)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding:fromGraph', 'coordinates', vertexCoordinates));
    }

    if (!isPlainObject(edgeArcControlDistances)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding:fromGraph', 'edgesArcControlDistance', edgeArcControlDistances));
    }

    let vertices = new Map();
    let edges = new Map();

    for (const v of graph.vertices) {
      let cs = vertexCoordinates[vertexId(v)];
      if (!(cs instanceof Point2D)) {
        cs = Point2D.random({ width, height });
      }
      let eV = new EmbeddedVertex(v.name, cs, { weight: v.weight });
      vertices.set(eV.id, eV);
    }

    for (const e of graph.edges) {
      const ee = new EmbeddedEdge(
        vertices.get(e.source.id),
        vertices.get(e.destination.id),
        {
          weight: e.weight,
          label: e.label,
          isDirected: graph.isDirected(),
          arcControlDistance: edgeArcControlDistances[e.id]
        });
      edges.set(ee.id, ee);
    }

    return new Embedding(vertices.values(), edges.values());
  }

  static completeGraph(n, canvasSize, directed = false) {
    if (!isNumber(n) || n < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeGraph', 'n', n));
    }

    if (!isNumber(canvasSize) || canvasSize <= 0) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeGraph', 'canvasSize', canvasSize));
    }

    // Make all these arguments are parsed as numbers
    [n, canvasSize] = [n, canvasSize].map(toNumber);

    const g = directed ? Graph.completeGraph(n) : UndirectedGraph.completeGraph(n);

    let coordinates = {};
    for (const v of g.vertices) {
      const i = toNumber(v.name) - 1;
      const delta = 2 * Math.PI / n;
      const center = canvasSize / 2;
      const radius = center - EmbeddedVertex.DEFAULT_VERTEX_RADIUS;
      coordinates[v.id] = new Point2D(center + radius * Math.cos(i * delta), center + radius * Math.sin(i * delta));
    }
    return Embedding.forGraph(g, { vertexCoordinates: coordinates });
  }

  static completeBipartiteGraph(n, m, canvasSize, directed = false) {
    if (!isNumber(n) || n < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeBipartiteGraph', 'n', n));
    }

    if (!isNumber(m) || m < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeBipartiteGraph', 'm', m));
    }

    if (!isNumber(canvasSize) || canvasSize <= 0) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding.completeBipartiteGraph', 'canvasSize', canvasSize));
    }

    // Make all these arguments are parsed as numbers
    [n, m, canvasSize] = [n, m, canvasSize].map(toNumber);

    const g = directed ? Graph.completeBipartiteGraph(n, m) : UndirectedGraph.completeBipartiteGraph(n, m);

    const deltaN = (canvasSize - 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS) / (n - 1);
    const deltaM = (canvasSize - 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS) / (m - 1);
    let coordinates = {};
    let x, y;

    for (const v of g.vertices) {
      const i = toNumber(v.name);
      if (i <= n) {
        x = 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS;
        y = EmbeddedVertex.DEFAULT_VERTEX_RADIUS + (i - 1) * deltaN;
      } else {
        x = canvasSize - 2 * EmbeddedVertex.DEFAULT_VERTEX_RADIUS;
        y = EmbeddedVertex.DEFAULT_VERTEX_RADIUS + (i - n - 1) * deltaM;
      }
      coordinates[v.id] = new Point2D(x, y);
    }
    return Embedding.forGraph(g, { vertexCoordinates: coordinates });
  }

  // -----  INSTANCE METHODS  -----

  constructor(vertices, edges) {
    if (!(Array.isArray(vertices) || isIterable(vertices))) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', vertices));
    }

    if (!(Array.isArray(edges) || isIterable(edges))) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', edges));
    }

    this.#vertices = new Map();
    this.#edges = new Map();

    for (const v of vertices) {
      if (!(v instanceof EmbeddedVertex)) {
        throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'vertices', vertices));
      }

      this.#vertices.set(v.id, v.clone());
    }

    for (const e of edges) {
      if (!(e instanceof EmbeddedEdge)) {
        throw new Error(ERROR_MSG_INVALID_ARGUMENT('Embedding()', 'edges', edges));
      }
      this.#edges.set(e.id,
        new EmbeddedEdge(
          this.getVertex(e.source),
          this.getVertex(e.destination),
          {
            weight: e.weight,
            label: e.label,
            isDirected: e.isDirected(),
            arcControlDistance: e.arcControlDistance
          }));
    }
  }

  get vertices() {
    return this.#vertices.values();
  }

  get edges() {
    return this.#edges.values();
  }

  /**
   *
   * @param {string|Vertex} vertex Either an instance of Vertex, or a vertex' id.
   */
  getVertex(vertex) {
    return this.#vertices.get(vertexId(vertex));
  }

  /**
   *
   * @param {string|Edge} edge Either an instance of Edge, or an edge's id.
   */
  getEdge(edge) {
    return this.#edges.get(edgeId(edge));
  }

  /**
   *
   * @param {string|Vertex} vertex Either an instance of Vertex, or a vertex' id.
   * @param {*} position
   */
  setVertexPosition(vertex, position) {
    const v = this.#vertices.get(vertexId(vertex));
    if (isUndefined(v)) {
      throw new Error(ERROR_MSG_VERTEX_NOT_FOUND('Embedding.setVertexPosition', vertex));
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
    const e = this.#edges.get(edgeId(edge));
    if (isUndefined(e)) {
      throw new Error(ERROR_MSG_EDGE_NOT_FOUND('Embedding.setEdgeControlPoint', edge));
    }
    if (!isNumber(arcControlDistance)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Embedding.setEdgeControlPoint', 'arcControlDistance', arcControlDistance));
    }
    e.arcControlDistance = toNumber(arcControlDistance);
  }

  rectilinearIntersections() {
    const edges = [...this.edges];
    const m = edges.length;
    let intersections = 0;

    for (let i = 0; i < m-1; i++) {
      const e1 = edges[i];
      if (e1.isLoop()) {
        continue;
      }
      for (let j = i+1; j < m; j++) {
        const e2 = edges[j];
        if (e2.isLoop()) {
          continue;
        }

        if (!areAdjacentEdges(e1, e2) && e1.isIntersecting(e2)) {
          intersections += 1;
        }
      }
    }

    return intersections;
  }

  isPlane() {
    return this.rectilinearIntersections() === 0;
  }

  clone() {
    return new Embedding(this.vertices, this.edges);
  }

  equals(other) {
    return (other instanceof Embedding) && this.toJson() === other.toJson();
  }

  toJson() {
    return consistentStringify(this.toJsonObject());
  }

  toJsonObject() {
    return {
      vertices: [...this.vertices].sort().map(v => v.toJson()),
      edges: [...this.edges].sort(Edge.compareEdges).map(e => e.toJson())
    };
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
 * @param {string|Vertex} vertex Either an instance of Vertex, or a vertex' id.
 */
function vertexId(vertex) {
  if (vertex instanceof Vertex) {
    return vertex.id;
  } else {
    return vertex;
  }
}

/**
 * @private
 * @param {Edge|string} edge
 */
function edgeId(edge) {
  if (edge instanceof Edge) {
    return edge.id;
  } else {
    return edge;
  }
}

/**
 * @private
 * @param {Edge} e1
 * @param {Edge} e2
 */
function areAdjacentEdges(e1, e2) {
  return e1.source.id === e2.source.id || e1.source.id === e2.destination.id ||
    e1.destination.id === e2.source.id || e1.destination.id === e2.destination.id;
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