import Edge from '../edge.js';
import EmbeddedVertex from './embedded_vertex.js';

import { isNonEmptyString, isString } from '../../common/strings.js';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.js';

class EmbeddedEdge extends Edge {
  #undirected

  constructor(source, destination, { weight, label, isUndirected = false } = {}) {
    if (!(source instanceof EmbeddedVertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'source', source));
    }
    if (!(destination instanceof EmbeddedVertex)) {
      throw new new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'destination', destination));
    }
    super(source, destination, { weight, label });
    this.#undirected = isUndirected;
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

  toSvg() {
    let [x1, y1] = this.source.position.coordinates();
    let [x2, y2] = this.destination.position.coordinates();
    let destRadius = this.destination.radius;
    let alpha = (y1 !== y2) ? Math.atan((x2 - x1) / (y2 - y1)) : Math.PI / 2;
    let [dx, dy] = [Math.sign(x2-x1) * destRadius * Math.sin(alpha), Math.sign(y2-y1) * destRadius * Math.cos(alpha)];

    let edgeLabel = isNonEmptyString(this.label)
      ? `<text x="${(x2 - x1) / 2}" y="${(y2 - y1) / 2}" text-anchor="middle"> ${this.label} </text>`
      : "";

    return `
      <g class="edge" transform="translate(${x1},${y1})">
        <line x1="${0}" y1="${0}" x2="${x2 - x1 - dx}" y2="${y2 - y1 - dy}" marker-end="${this.#undirected ? "" : "url(#arrowhead)"}"/>
        ${edgeLabel}
      </g>`;
  }
}

export default EmbeddedEdge;