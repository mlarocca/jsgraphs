import Edge from '../edge.mjs';
import EmbeddedVertex from './embedded_vertex.mjs';

import Point2D from '../../geometric/point2d.mjs';

import { isNonEmptyString } from '../../common/strings.mjs';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.mjs';
import { isNumber, toNumber } from '../../common/numbers.mjs';
import { isBoolean, isUndefined } from '../../common/basic.mjs';


const DEFAULT_LABEL_WEIGHT_SEPARATOR = '/';

class EmbeddedEdge extends Edge {
  static DEFAULT_EDGE_BEZIER_CONTROL_DISTANCE = 40;
  static DEFAULT_EDGE_LOOP_RADIUS = 25;

  /**
   * @static
   */
  static fromJson(json) {
    return EmbeddedEdge.fromJsonObject(JSON.parse(json));
  }

  /**
   * @static
   */
  static fromJsonObject({ source, destination, weight, label, isDirected, arcControlDistance }) {
    return new EmbeddedEdge(
      EmbeddedVertex.fromJsonObject(source),
      EmbeddedVertex.fromJsonObject(destination),
      {
        weight: weight,
        label: label ?? undefined,
        isDirected: isDirected,
        arcControlDistance: arcControlDistance
      });
  }

  /**
   * @private
   */
  #directed;

  /**
   * @field arcControlDistance
   * @private
   * @description
   * The distance between the segment passing through an edge's ends, and the control point of the
   * Bézier quadratic curve used to draw the edge as an arc.
   * See https://github.com/mlarocca/jsgraphs/raw/master/readme/img/tutorial/tutorial_quadratic_bezier_curve.png
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
      arcControlDistance = undefined } = {}) {
    if (!(source instanceof EmbeddedVertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'source', source));
    }
    if (!(destination instanceof EmbeddedVertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'destination', destination));
    }

    super(source, destination, { weight, label });

    if (!isBoolean(isDirected)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'isDirected', isDirected));
    }
    this.#directed = isDirected;

    if (isUndefined(arcControlDistance)) {
      this.#arcControlDistance = super.isLoop()
        ? EmbeddedEdge.DEFAULT_EDGE_LOOP_RADIUS
        : EmbeddedEdge.DEFAULT_EDGE_BEZIER_CONTROL_DISTANCE;
    } else if (!isNumber(arcControlDistance)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge()', 'arcControlDistance', arcControlDistance));
    } else {
      this.#arcControlDistance = toNumber(arcControlDistance);
    }
  }

  get arcControlDistance() {
    return this.#arcControlDistance;
  }

  set arcControlDistance(arcControlDistance) {
    if (!isNumber(arcControlDistance)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge.arcControlDistance=', 'arcControlDistance', arcControlDistance));
    }
    this.#arcControlDistance = toNumber(arcControlDistance);
  }

  isDirected() {
    return this.#directed;
  }

  /**
   * @method isCrossing
   * @for EmbeddedEdge
   * @description
   * Checks if this edge is crossing another arbitrary edge passed as argument.
   *
   * @param {EmbeddedEdge} other The other edge, with which we need to check if there is an intersection.
   * @param {boolean} straightLineEmbedding Switch between a straight-line embedding, where all edges are drawn as
   *                                        segments, and an embedding where edges are drawn as Bézier quadratic curves.
   */
  isCrossing(other, straightLineEmbedding = true) {
    if (!(other instanceof EmbeddedEdge)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('isCrossing', 'other', other));
    }

    if (!straightLineEmbedding) {
      throw new Error('Not yet implemented');
    }

    const A = this.source.position;
    const B = this.destination.position;

    const C = other.source.position;
    const D = other.destination.position;

    // Computes the multiplication factor for both segments
    const h = computeSegmentIntersectionCoefficient(A, B, C, D);
    const g = computeSegmentIntersectionCoefficient(C, D, A, B);

    // If the m.f. is in [0, 1] for both segments, then they intersect. (we need to deal with lousy floating point arithmetic)
    return 0 - Number.EPSILON <= h && h <= 1 + Number.EPSILON && 0 - Number.EPSILON <= g && g <= 1 + Number.EPSILON;
  }

  /**
   * @override
   */
  clone() {
    return new EmbeddedEdge(
      this.source.clone(),
      this.destination.clone(),
      { weight: this.weight, label: this.label, arcControlDistance: this.arcControlDistance, isDirected: this.isDirected() });
  }

  toJsonObject() {
    return {
      source: this.source.toJsonObject(),
      destination: this.destination.toJsonObject(),
      weight: this.weight,
      label: this.label,
      isDirected: this.isDirected(),
      arcControlDistance: this.arcControlDistance
    };
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

  const srcVertexRadius = edge.source.radius();
  const destVertexRadius = edge.destination.radius();

  const alpha = Math.atan2(x2 - x1, y2 - y1);
  const [dx2, dy2] = [destVertexRadius * Math.sin(alpha), destVertexRadius * Math.cos(alpha)];
  const [dx1, dy1] = [srcVertexRadius * Math.sin(alpha), srcVertexRadius * Math.cos(alpha)];

  // Coordinates for text
  const [tx, ty] = [(x2 - x1 - dx2 + dx1) / 2, (y2 - y1 - dy2 + dy1) / 2];

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

  const srcVertexRadius = edge.source.radius();
  const destVertexRadius = edge.destination.radius();

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
    (x2 - x1 - dx2 + dx1) / 2 + arcControlDistance / 2 * Math.sin(Math.PI / 2 + alpha),
    (y2 - y1 - dy2 + dy1) / 2 + arcControlDistance / 2 * Math.cos(Math.PI / 2 + alpha)
  ];

  // If the edge is directed, we need it to stop at the intersection with the vertex, to show the arrow
  // Otherwise, having the arc drawn to the center of the destination vertex gives a better visual result
  const [xDest, yDest] = [
    x2 - x1 - (edge.isDirected() ? dx2 : 0),
    y2 - y1 - (edge.isDirected() ? dy2 : 0)
  ];

  return `
    <g class="edge ${cssClasses.join(' ')}" transform="translate(${Math.round(x1)},${Math.round(y1)})">
      <path d="M${0},${0} Q${Math.round(cx)},${Math.round(cy)} ${Math.round(xDest)},${Math.round(yDest)}"
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
  const delta = edge.source.radius() * Math.cos(Math.PI / 4);
  const [x2, y2] = [delta, -delta];
  const [tx, ty] = [delta + arcRadius, -delta - arcRadius];

  return `
  <g class="edge ${cssClasses.join(' ')}" transform="translate(${Math.round(x)},${Math.round(y)})">
    <path d="M ${0} ${Math.round(-edge.source.radius())} A ${arcRadius} ${arcRadius}, 0, 1, 1, ${Math.round(x2)} ${Math.round(y2)}"
     marker-end="${edge.isDirected() ? "url(#arrowhead)" : ""}"/>
     ${edgeLabel(edge, tx, ty, displayLabel, displayWeight)}
    </g>`;
}

/**
 * @name edgeLabel
 * @private
 *
 * @param {*} edge
 * @param {*} tx
 * @param {*} ty
 * @param {*} displayLabel
 * @param {*} displayWeight
 */
function edgeLabel(edge, tx, ty, displayLabel, displayWeight) {
  let labelText = [
    displayLabel ? edge.escapedLabel : '',
    displayWeight ? edge.weight.toString() : ''
  ].filter(isNonEmptyString).join(DEFAULT_LABEL_WEIGHT_SEPARATOR);

  let edgeLabel = isNonEmptyString(labelText)
    ? `<text x="${Math.round(tx)}" y="${Math.round(ty)}" text-anchor="middle" dominant-baseline="central"> ${labelText} </text>`
    : "";

  return edgeLabel;
}

/**
 * @name computeSegmentIntersectionCoefficient
 * @private
 *
 * @param {Point2D} A One endpoint of the first segment.
 * @param {Point2D} B The other endpoint of the first segment.
 * @param {Point2D} C One endpoint of the second segment.
 * @param {Point2D} D The other endpoint of the second segment.
 *
 * @return {number} h is a multiplication factor: how much you have to multiply the length of the first segment in order to
 *                  exactly touch the line passing by the second segment.
 */
function computeSegmentIntersectionCoefficient(A, B, C, D) {
  const v = B.subtract(A);
  const w = D.subtract(C);
  const u = new Point2D(-v.y, v.x);
  return A.subtract(C).dotProduct(u) / w.dotProduct(u);
}


export default EmbeddedEdge;