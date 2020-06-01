import Graph from './src/graph/graph.mjs';
import { UndirectedGraph } from './src/graph/graph.mjs';
import Vertex from './src/graph/vertex.mjs';
import Edge from './src/graph/edge.mjs';
import Embedding from './src/graph/embedding/embedding.mjs';
import {isPlanar} from './src/graph/algo/planarity/kuratowski.mjs';
import {minimumIntersectionsEmbedding} from './src/graph/algo/crossing_number/randomized_mcn.mjs';
import {Permutations} from './src/graph/algo/combinatorial.mjs';
import simulatedAnnealing from './src/graph/algo/simulated_annealing/simulated_annealing.mjs';
import tsp from './src/graph/algo/simulated_annealing/tsp.mjs';

import Point2D from './src/geometric/point2d.mjs';

globalThis.jsgraphs = {
  Point2D: Point2D,
  Graph: Graph,
  UndirectedGraph: UndirectedGraph,
  Edge: Edge,
  Vertex: Vertex,
  Embedding: Embedding,
  algo: {
    isPlanar: isPlanar,
    randomizedMinimumIntersectionsEmbedding: minimumIntersectionsEmbedding,
    simulatedAnnealing: simulatedAnnealing,
    Permutations: Permutations,
    travelingSalesmanProblem: tsp
  }
}