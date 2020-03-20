import Edge from '../edge.js';
import EmbeddedVertex from './embedded_vertex.js';

import { isNonEmptyString, isString } from '../../common/strings.js';
import { ERROR_MSG_INVALID_ARGUMENT } from '../../common/errors.js';

class EmbeddedEdge extends Edge {
  #sourceVertex
  #destinationVertex
  #undirected

  constructor(source, destination, { weight, label, isUndirected = false } = {}) {
    if (!(source instanceof EmbeddedVertex)) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'source', source));
    }
    if (!(destination instanceof EmbeddedVertex)) {
      throw new new Error(ERROR_MSG_INVALID_ARGUMENT('EmbeddedEdge', 'destination', destination));
    }
    super(source.label, destination.label, { weight, label });
    this.#sourceVertex = source;
    this.#destinationVertex = destination;
    this.#undirected = isUndirected;
  }

  get source() {
    return this.#sourceVertex.clone();
  }

  get destination() {
    return this.#destinationVertex.clone();
  }

  clone() {
    throw new Error("unimplemented");
  }

  toJson() {
    return JSON.stringify({
      source: this.source.toJson(),
      destination: this.destination.toJson(),
      label: this.label,
      weight: this.weight,
    });
  }

  toString() {
    return `EmbeddedEdge: ${this.toJson()}`;
  }

  toSvg() {
    let [x1, y1] = this.#sourceVertex.position.coordinates();
    let [x2, y2] = this.#destinationVertex.position.coordinates();
    let destRadius = this.#destinationVertex.radius;
    let alpha = (y1 !== y2) ? Math.atan((x2 - x1) / (y2 - y1)) : Math.PI / 2;
    let [dx, dy] = [Math.sign(x2-x1) * destRadius * Math.sin(alpha), Math.sign(y2-y1) * destRadius * Math.cos(alpha)];
// console.log(dx, dy, alpha, (x2 - x1) / (y2 - y1))
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