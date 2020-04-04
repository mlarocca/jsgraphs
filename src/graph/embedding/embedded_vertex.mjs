import Vertex from '../vertex.mjs';

import Point2D from '../../geometric/point2d.mjs';

import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.mjs';

class EmbeddedVertex extends Vertex {

  static DEFAULT_VERTEX_RADIUS = 15;

  /**
   * @protected
   */
  _center;

  /**
   * @static
   */
  static fromJson(json) {
    return EmbeddedVertex.fromJsonObject(JSON.parse(json));
  }

  /**
   * @static
   */
  static fromJsonObject({ label, position, weight = null }) {
    return new EmbeddedVertex(label, Point2D.fromJson(position), { weight: weight });
  }

  constructor(label, vertexPosition, { weight } = {}) {
    super(label, { weight: weight });
    if (!(vertexPosition instanceof Point2D) || vertexPosition.dimensionality < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex()', 'vertexPosition', vertexPosition));
    }

    this._center = vertexPosition.clone();
  }

  get position() {
    return this._center.clone();
  }

  /**
   * @param {Point2D} center
   */
  set position(center) {
    if (!(center instanceof Point2D)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex.setPosition', 'center', center));
    }
    this._center = center.clone();
  }

  radius() {
    return EmbeddedVertex.DEFAULT_VERTEX_RADIUS * this.weight;
  }

  clone() {
    return new EmbeddedVertex(this.label, this.position, { weight: this.weight });
  }

  toJsonObject() {
    return {
      label: this.label,
      weight: this.weight,
      position: this._center.toJson()
    };
  }

  toString() {
    return `EmbeddedVertex: ${this.toJson()}`;
  }

  toSvg(cssClasses = []) {
    let [x, y] = this.position.coordinates();
    return `
    <g class="vertex ${cssClasses.join(' ')}" transform="translate(${x},${y})">
      <circle cx="0" cy="0" r="${this.radius()}" />
      <text x="0" y="0" text-anchor="middle" dominant-baseline="central">${this.escapedLabel}</text>
    </g>`;
  }
}

export default EmbeddedVertex;