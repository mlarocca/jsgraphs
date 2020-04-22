import Graph from './src/graph/graph.mjs';
import { UndirectedGraph } from './src/graph/graph.mjs';
import Vertex from './src/graph/vertex.mjs';
import Edge from './src/graph/edge.mjs';
import Embedding from './src/graph/embedding/embedding.mjs';
import {isPlanar} from './src/graph/algo/planarity/kuratowski.mjs';
import Point2D from './src/geometric/point2d.mjs';

globalThis.jsgraphs = {
  Point2D: Point2D,
  Graph: Graph,
  UndirectedGraph: UndirectedGraph,
  Edge: Edge,
  Vertex: Vertex,
  Embedding: Embedding,
  algo: {
    isPlanar: isPlanar
  }
}