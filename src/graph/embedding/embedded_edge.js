import Edge from '../edge.js';
import EmbeddedVertex from './embedded_vertex.js';

import { isNonEmptyString } from '../../common/strings.js';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.js';

const EDGE_BEZIER_CONTROL_DISTANCE = 40;
const EDGE_LOOP_RADIUS = 15;

class EmbeddedEdge extends Edge {
  #directed;

  constructor(source, destination, { weight, label, isDirected = false } = {}) {
    if (!(source instanceof EmbeddedVertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'source', source));
    }
    if (!(destination instanceof EmbeddedVertex)) {
      throw new new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'destination', destination));
    }
    super(source, destination, { weight, label });
    this.#directed = isDirected;
  }

  isDirected() {
    return this.#directed;
  }

  /**
   * @override
   */
  clone() {
    return new EmbeddedEdge(
      this.source.clone(),
      this.destination.clone(),
      { weight: this.weight, label: this.label });
  }

  toJson() {
    return super.toJson();
  }

  toString() {
    return `EmbeddedEdge: ${this.toJson()}`;
  }

  toSvg({ cssClasses = [], useArcs = false } = {}) {
    if (this.isLoop()) {
      return loopSvg(this, cssClasses);
    } else if (this.isDirected && useArcs) {
      return arcEdgeSvg(this, cssClasses);
    } else {
      return rectilinearEdgeSvg(this, cssClasses);
    }
  }
}

/**
 * @for EmbeddedEdge
 * @private
 * @param {EmbeddedEdge} edge
 * @param {Array<string>} cssClasses
 */
function rectilinearEdgeSvg(edge, cssClasses) {
  const [x1, y1] = edge.source.position.coordinates();
  const [x2, y2] = edge.destination.position.coordinates();

  const srcVertexRadius = edge.source.radius;
  const destVertexRadius = edge.destination.radius;

  const alpha = Math.atan2(x2 - x1, y2 - y1);
  const [dx2, dy2] = [destVertexRadius * Math.sin(alpha), destVertexRadius * Math.cos(alpha)];
  const [dx1, dy1] = [srcVertexRadius * Math.sin(alpha), srcVertexRadius * Math.cos(alpha)];

  // Coordinates for text
  const [tx, ty] = [(x2 - x1) / 2, (y2 - y1) / 2];


  let edgeLabel = isNonEmptyString(edge.label)
    ? `<text x="${Math.round(tx)}" y="${Math.round(ty)}" text-anchor="middle"> ${edge.label} </text>`
    : "";

  return `
    <g class="edge ${cssClasses.join(' ')}" transform="translate(${Math.round(x1)},${Math.round(y1)})">
      <path d="M${Math.round(dx1)},${Math.round(dy1)} L${Math.round(x2 - x1 - dx2)},${Math.round(y2 - y1 - dy2)}"
       marker-end="${edge.isDirected() ? "url(#arrowhead)" : ""}"/>
      ${edgeLabel}
    </g>`;
}

/**
 * @for EmbeddedEdge
 * @private
 * @param {EmbeddedEdge} edge
 * @param {Array<string>} cssClasses
 */
function arcEdgeSvg(edge, cssClasses) {
  const [x1, y1] = edge.source.position.coordinates();
  const [x2, y2] = edge.destination.position.coordinates();

  const srcVertexRadius = edge.source.radius;
  const destVertexRadius = edge.destination.radius;

  const alpha = Math.atan2(x2 - x1, y2 - y1);
  const [dx1, dy1] = [srcVertexRadius * Math.sin(alpha), srcVertexRadius * Math.cos(alpha)];
  const [dx2, dy2] = [destVertexRadius * Math.sin(alpha), destVertexRadius * Math.cos(alpha)];

  // Relative coordinates of the control point for the quadratic bezier curve
  // The point is meant to be 40px above the middle of the segment between the two vertices
  // therefore the angle to be used is 90° + the segment's angle.
  const [cx, cy] = [
    (x2 - x1) / 2 + EDGE_BEZIER_CONTROL_DISTANCE * Math.sin(Math.PI / 2 + alpha),
    (y2 - y1) / 2 + EDGE_BEZIER_CONTROL_DISTANCE * Math.cos(Math.PI / 2 + alpha)
  ];

  // Coordinates for text
  const [tx, ty] = [
    (x2 - x1) / 2 + EDGE_BEZIER_CONTROL_DISTANCE / 2 * Math.sin(Math.PI / 2 + alpha) ,
    (y2 - y1) / 2 + EDGE_BEZIER_CONTROL_DISTANCE / 2 * Math.cos(Math.PI / 2 + alpha)
  ];

  let edgeLabel = isNonEmptyString(edge.label)
    ? `<text x="${Math.round(tx)}" y="${Math.round(ty)}" text-anchor="middle"> ${edge.label} </text>`
    : "";

  return `
    <g class="edge ${cssClasses.join(' ')}" transform="translate(${Math.round(x1)},${Math.round(y1)})">
      <path d="M${Math.round(dx1)},${Math.round(dy1)} Q${Math.round(cx)},${Math.round(cy)} ${Math.round(x2 - x1 - dx2)},${Math.round(y2 - y1 - dy2)}"
       marker-end="${edge.isDirected() ? "url(#arrowhead)" : ""}"/>
      ${edgeLabel}
    </g>`;
}

/**
 * @for EmbeddedEdge
 * @private
 * @param {EmbeddedEdge} edge
 * @param {Array<string>} cssClasses
 */
function loopSvg(edge, cssClasses) {

  const [x, y] = edge.source.position.coordinates();
  const arcRadius = Math.round(Math.sqrt(edge.source.weight) * EDGE_LOOP_RADIUS);
  const delta = edge.source.radius * Math.cos(Math.PI / 4);
  const [x2, y2] = [delta, -delta];
  const [tx, ty] = [delta + arcRadius, -delta - arcRadius];

  let edgeLabel = isNonEmptyString(edge.label)
    ? `<text x="${Math.round(tx)}" y="${Math.round(ty)}" text-anchor="middle"> ${edge.label} </text>`
    : "";

  return `
  <g class="edge ${cssClasses.join(' ')}" transform="translate(${Math.round(x)},${Math.round(y)})">
    <path d="M ${0} ${Math.round(-edge.source.radius)} A ${arcRadius} ${arcRadius}, 0, 1, 1, ${Math.round(x2)} ${Math.round(y2)}"
     marker-end="${edge.isDirected() ? "url(#arrowhead)" : ""}"/>
    ${edgeLabel}
  </g>`;
}
export default EmbeddedEdge;