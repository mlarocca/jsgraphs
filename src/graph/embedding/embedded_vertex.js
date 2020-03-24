import Vertex from '../vertex.js';
import Point from '../../geometric/point.js';

import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.js';
import { isNumber } from '../../common/numbers.js';
import Point2D from '../../geometric/point2d.js';

class EmbeddedVertex extends Vertex {

  static DEFAULT_VERTEX_RADIUS = 15;

  #center;

  #radius;

  constructor(label, vertexPosition, { weight, vertexRadius = EmbeddedVertex.DEFAULT_VERTEX_RADIUS } = {}) {
    super(label, { weight: weight });
    if (!(vertexPosition instanceof Point) || vertexPosition.dimensionality < 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex', 'coordinates', vertexPosition));
    }
    if (!isNumber(vertexRadius) || vertexRadius <= 0 ) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedVertex', 'vertexRardius', vertexRadius));
    }

    this.#center = vertexPosition.clone();
    this.#radius = vertexRadius;
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

  toJson() {
    return JSON.stringify({
      label: this.id,
      weight: this.weight,
      coordinates: this.position.toJson()
    });
  }

  toString() {
    return `EmbeddedVertex: ${this.toJson()}`;
  }

  toSvg(cssClasses = []) {
    let [x, y] = this.position.coordinates();
    return `
    <g class="vertex ${cssClasses.join(' ')}" transform="translate(${x},${y})">
      <circle cx="0" cy="0" r="${this.radius}" />
      <text x="0" y="0" text-anchor="middle">${this.label}</text>
    </g>`;
  }
}

export default EmbeddedVertex;