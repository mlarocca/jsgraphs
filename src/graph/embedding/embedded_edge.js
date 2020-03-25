import Edge from '../edge.js';
import EmbeddedVertex from './embedded_vertex.js';

import { isNonEmptyString } from '../../common/strings.js';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.js';
import { isNumber } from '../../common/numbers.js';

const DEFAULT_EDGE_BEZIER_CONTROL_DISTANCE = 40;
const DEFAULT_EDGE_LOOP_RADIUS = 15;
const DEFAULT_LABEL_WEIGHT_SEPARATOR = '/';

class EmbeddedEdge extends Edge {
  /**
   * @private
   */
  #directed;

  /**
   * @private
   */
  #arcControlDistance

  /**
   *
   * @param {*} source
   * @param {*} destination
   * @param {Number} arcControlDistance The distance of the control point of the Bezier quadratic curve used to display the edge.
   */
  constructor(
    source,
    destination,
    { weight,
      label,
      isDirected = false,
      arcControlDistance = null } = {}) {
    if (!(source instanceof EmbeddedVertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'source', source));
    }
    if (!(destination instanceof EmbeddedVertex)) {
      throw new new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'destination', destination));
    }

    super(source, destination, { weight, label });

    this.#directed = isDirected;

    if (!isNumber(arcControlDistance)) {
      this.#arcControlDistance = super.isLoop ? DEFAULT_EDGE_LOOP_RADIUS : DEFAULT_EDGE_BEZIER_CONTROL_DISTANCE;
    } else {
      this.#arcControlDistance = arcControlDistance;
    }
  }

  get arcControlDistance() {
    return this.#arcControlDistance;
  }

  set arcControlDistance(arcControlDistance) {
    this.#arcControlDistance = arcControlDistance;
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

  /**
   * @method toSvg
   * @for EmbeddedEdge
   *
   * @param {EmbeddedEdge} edge The edge to draw with an arc.
   * @param {Array<string>} cssClasses One or more css classes to optionally be applied to this edge.
   * @param {boolean} displayLabel Whether or not the edge's label should be displayed.
   * @param {boolean} displayWeight Whether or not the edge's weight should be displayed.
   *
   * @return {string} The SVG code to display current arc.
   */
  toSvg({
    cssClasses = [],
    drawAsArc = false,
    displayLabel = true,
    displayWeight = true
  } = {}) {
    if (this.isLoop()) {
      return loopSvg(this, cssClasses, displayLabel, displayWeight);
    } else if (this.isDirected && drawAsArc) {
      return arcEdgeSvg(this, cssClasses, displayLabel, displayWeight, this.#arcControlDistance);
    } else {
      return rectilinearEdgeSvg(this, cssClasses, displayLabel, displayWeight);
    }
  }
}

/**
 * @for EmbeddedEdge
 * @private
 * @param {EmbeddedEdge} edge The edge to draw with a segment.
 * @param {Array<string>} cssClasses One or more css classes to optionally be applied to this edge.
 * @param {boolean} displayLabel Whether or not the edge's label should be displayed.
 * @param {boolean} displayWeight Whether or not the edge's weight should be displayed.
 */
function rectilinearEdgeSvg(edge, cssClasses, displayLabel, displayWeight) {
  const [x1, y1] = edge.source.position.coordinates();
  const [x2, y2] = edge.destination.position.coordinates();

  const srcVertexRadius = edge.source.radius;
  const destVertexRadius = edge.destination.radius;

  const alpha = Math.atan2(x2 - x1, y2 - y1);
  const [dx2, dy2] = [destVertexRadius * Math.sin(alpha), destVertexRadius * Math.cos(alpha)];
  const [dx1, dy1] = [srcVertexRadius * Math.sin(alpha), srcVertexRadius * Math.cos(alpha)];

  // Coordinates for text
  const [tx, ty] = [(x2 - x1) / 2, (y2 - y1) / 2];

  return `
    <g class="edge ${cssClasses.join(' ')}" transform="translate(${Math.round(x1)},${Math.round(y1)})">
      <path d="M${Math.round(dx1)},${Math.round(dy1)} L${Math.round(x2 - x1 - dx2)},${Math.round(y2 - y1 - dy2)}"
       marker-end="${edge.isDirected() ? "url(#arrowhead)" : ""}"/>
      ${edgeLabel(edge, tx, ty, displayLabel, displayWeight)}
    </g>`;
}

/**
 * @for EmbeddedEdge
 * @private
 *
 * @param {EmbeddedEdge} edge The edge to draw with an arc.
 * @param {Array<string>} cssClasses One or more css classes to optionally be applied to this edge.
 * @param {boolean} displayLabel Whether or not the edge's label should be displayed.
 * @param {boolean} displayWeight Whether or not the edge's weight should be displayed.
 * @param {Number} arcControlDistance The distance of the control point of the Bezier quadratic curve used to display the edge.
 */
function arcEdgeSvg(edge, cssClasses, displayLabel, displayWeight, arcControlDistance) {
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
    (x2 - x1) / 2 + arcControlDistance * Math.sin(Math.PI / 2 + alpha),
    (y2 - y1) / 2 + arcControlDistance * Math.cos(Math.PI / 2 + alpha)
  ];

  // Coordinates for text
  const [tx, ty] = [
    (x2 - x1) / 2 + arcControlDistance / 2 * Math.sin(Math.PI / 2 + alpha),
    (y2 - y1) / 2 + arcControlDistance / 2 * Math.cos(Math.PI / 2 + alpha)
  ];

  return `
    <g class="edge ${cssClasses.join(' ')}" transform="translate(${Math.round(x1)},${Math.round(y1)})">
      <path d="M${Math.round(dx1)},${Math.round(dy1)} Q${Math.round(cx)},${Math.round(cy)} ${Math.round(x2 - x1 - dx2)},${Math.round(y2 - y1 - dy2)}"
       marker-end="${edge.isDirected() ? "url(#arrowhead)" : ""}"/>
      ${edgeLabel(edge, tx, ty, displayLabel, displayWeight)}
    </g>`;
}

/**
 * @for EmbeddedEdge
 * @private
 * @param {EmbeddedEdge} edge
 * @param {Array<string>} cssClasses
 * @param {boolean} displayLabel
 * @param {boolean} displayWeight
 */
function loopSvg(edge, cssClasses, displayLabel, displayWeight) {
  const [x, y] = edge.source.position.coordinates();
  const arcRadius = Math.round(Math.sqrt(edge.source.weight) * edge.arcControlDistance);
  const delta = edge.source.radius * Math.cos(Math.PI / 4);
  const [x2, y2] = [delta, -delta];
  const [tx, ty] = [delta + arcRadius, -delta - arcRadius];

  return `
  <g class="edge ${cssClasses.join(' ')}" transform="translate(${Math.round(x)},${Math.round(y)})">
    <path d="M ${0} ${Math.round(-edge.source.radius)} A ${arcRadius} ${arcRadius}, 0, 1, 1, ${Math.round(x2)} ${Math.round(y2)}"
     marker-end="${edge.isDirected() ? "url(#arrowhead)" : ""}"/>
     ${edgeLabel(edge, tx, ty, displayLabel, displayWeight)}
    </g>`;
}

/**
 *
 * @param {*} edge
 * @param {*} tx
 * @param {*} ty
 * @param {*} displayLabel
 * @param {*} displayWeight
 */
function edgeLabel(edge, tx, ty, displayLabel, displayWeight) {
  let labelText = [
    (displayLabel && isNonEmptyString(edge.label)) ? edge.label : '',
    displayWeight ? edge.weight.toString() : ''
  ].filter(isNonEmptyString).join(DEFAULT_LABEL_WEIGHT_SEPARATOR);

  let edgeLabel = isNonEmptyString(labelText)
    ? `<text x="${Math.round(tx)}" y="${Math.round(ty)}" text-anchor="middle"> ${labelText} </text>`
    : "";

  return edgeLabel;
}
export default EmbeddedEdge;