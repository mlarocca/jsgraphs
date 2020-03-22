import Edge from '../edge.js';
import EmbeddedVertex from './embedded_vertex.js';

import { isNonEmptyString, isString } from '../../common/strings.js';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.js';

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

  toSvg(cssClasses = [], useArcs = false) {
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
  let [x1, y1] = edge.source.position.coordinates();
  let [x2, y2] = edge.destination.position.coordinates();
  let destRadius = edge.destination.radius;
  let alpha = Math.atan2(x2 - x1, y2 - y1);
  let [dx, dy] = [destRadius * Math.sin(alpha), destRadius * Math.cos(alpha)];

  let edgeLabel = isNonEmptyString(edge.label)
    ? `<text x="${(x2 - x1) / 2}" y="${(y2 - y1) / 2}" text-anchor="middle"> ${edge.label} </text>`
    : "";

  return `
    <g class="edge ${cssClasses.join(' ')}" transform="translate(${x1},${y1})">
      <line x1="${0}" y1="${0}" x2="${x2 - x1 - dx}" y2="${y2 - y1 - dy}" marker-end="${edge.isDirected() ? "url(#arrowhead)" : ""}"/>
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

}

/**
 * @for EmbeddedEdge
 * @private
 * @param {EmbeddedEdge} edge
 * @param {Array<string>} cssClasses
 */
function loopSvg(edge, cssClasses) {

}
export default EmbeddedEdge;