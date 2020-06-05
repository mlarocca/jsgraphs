import Graph from './src/graph/graph.mjs';
import { UndirectedGraph } from './src/graph/graph.mjs';
import Vertex from './src/graph/vertex.mjs';
import Edge from './src/graph/edge.mjs';
import Embedding from './src/graph/embedding/embedding.mjs';
import {isPlanar} from './src/graph/algo/planarity/kuratowski.mjs';
import {default as randomMce} from './src/graph/algo/random_sampling/mcn.mjs';
import {Permutations} from './src/graph/algo/combinatorial.mjs';
import simulatedAnnealing from './src/graph/algo/simulated_annealing/simulated_annealing.mjs';
import tsp from './src/graph/algo/simulated_annealing/tsp.mjs';
import {default as annealingMce} from './src/graph/algo/simulated_annealing/mcn.mjs';
import niceEmbedding from './src/graph/algo/simulated_annealing/nice.mjs';

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
    randomSampling : {
      minimumIntersectionsEmbedding: randomMce
    },
    simulatedAnnealing: {
      simulatedAnnealing: simulatedAnnealing,
      travelingSalesmanProblem: tsp,
      minimumIntersectionsEmbedding: annealingMce,
      niceEmbedding: niceEmbedding
    },
    Permutations: Permutations,
  }
}