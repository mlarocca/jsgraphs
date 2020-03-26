import Vertex from '../vertex.js';

import Point2D from '../../geometric/point2d.js';

import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.js';
import { isNumber, toNumber } from '../../common/numbers.js';

class EmbeddedVertex extends Vertex {

  static DEFAULT_VERTEX_RADIUS = 15;

  /**
   * @private
   */
  #center;

  /**
   * @private
   */
  #radius;

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

  constructor(label, vertexPosition, { weight, vertexRadius = EmbeddedVertex.DEFAULT_VERTEX_RADIUS } = {}) {
    super(label, { weight: weight });
    if (!(vertexPosition instanceof Point2D) || vertexPosition.dimensionality < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex()', 'vertexPosition', vertexPosition));
    }

    const radius = toNumber(vertexRadius);
    if (!isNumber(radius) || radius <= 0 ) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex()', 'vertexRadius', vertexRadius));
    }

    this.#center = vertexPosition.clone();
    this.#radius = radius;
  }

  get position() {
    return this.#center.clone();
  }

  set position(center) {
    if (!(center instanceof Point2D)) {
      throw new TypeError(ERROR_MSG_INVALID_ARGUMENT('Vertex.setPosition', 'center', center));
    }
    this.#center = center.clone();
  }

  get radius() {
    return this.#radius * this.weight;
  }

  clone() {
    return new EmbeddedVertex(this.label, this.position, { weight: this.weight });
  }

  toJsonObject() {
    return {
      label: this.label,
      weight: this.weight,
      position: this.position.toJson()
    };
  }

  toString() {
    return `EmbeddedVertex: ${this.toJson()}`;
  }

  toSvg(cssClasses = []) {
    let [x, y] = this.position.coordinates();
    return `
    <g class="vertex ${cssClasses.join(' ')}" transform="translate(${x},${y})">
      <circle cx="0" cy="0" r="${this.radius}" />
      <text x="0" y="0" text-anchor="middle" dominant-baseline="central">${this.label}</text>
    </g>`;
  }
}

export default EmbeddedVertex;