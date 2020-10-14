import Graph from './src/graph/graph.mjs';
import { UndirectedGraph } from './src/graph/graph.mjs';
import Vertex from './src/graph/vertex.mjs';
import Edge from './src/graph/edge.mjs';
import Embedding from './src/graph/embedding/embedding.mjs';
import EmbeddedEdge from './src/graph/embedding/embedded_edge.mjs';
import EmbeddedVertex from './src/graph/embedding/embedded_vertex.mjs';
import { isPlanar } from './src/graph/algo/planarity/kuratowski.mjs';
import { default as randomMce } from './src/graph/algo/random_sampling/mcn.mjs';
import { Permutations } from './src/graph/algo/combinatorial.mjs';
import simulatedAnnealing from './src/algo/simulated_annealing.mjs';
import geneticAlgorithm from './src/algo/genetic_algorithm.mjs';
import tspSA from './src/graph/algo/simulated_annealing/tsp.mjs';
import { default as annealingMce } from './src/graph/algo/simulated_annealing/mcn.mjs';
import niceEmbeddingSA from './src/graph/algo/simulated_annealing/nice_embedding.mjs';
import niceEmbeddingGA from './src/graph/algo/genetic/nice_embedding.mjs';
import vertexCoverGA from './src/graph/algo/genetic/vertex_cover.mjs';
import tspGA from './src/graph/algo/genetic/tsp.mjs';

import Point2D from './src/geometric/point2d.mjs';

const jsgraphs = {
  Point2D: Point2D,
  Graph: Graph,
  UndirectedGraph: UndirectedGraph,
  Edge: Edge,
  Vertex: Vertex,
  Embedding: Embedding,
  EmbeddedEdge: EmbeddedEdge,
  EmbeddedVertex: EmbeddedVertex,
  algo: {
    isPlanar: isPlanar,
    randomSampling: {
      minimumIntersectionsEmbedding: randomMce
    },
    simulatedAnnealing: {
      simulatedAnnealing: simulatedAnnealing,
      travelingSalesmanProblem: tspSA,
      minimumIntersectionsEmbedding: annealingMce,
      niceEmbedding: niceEmbeddingSA
    },
    geneticAlgorithms: {
      geneticAlgorithm: geneticAlgorithm,
      niceEmbedding: niceEmbeddingGA,
      travelingSalesmanProblem: tspGA,
      vertexCover: vertexCoverGA
    },
    Permutations: Permutations,
  }
}

window.jsgraphs = jsgraphs;
export default jsgraphs;