# jsgraphs
A lightweight library to model graphs, run graphs' algorithms, and display them on screen.

# Installation

From the base folder:

```
nvm install stable

npm install
```


# Run tests

From the base folder:

```
npm t test/$FOLDER/$TEST
```

For instance

```
npm t test/geometric/test_point.js
```

# Examples

The library allows to create arbitrary graphs, but also
Graphs can be embedded in the plane, vertices can be positioned arbitrarily, and both vertices and edges can be styled individually.

## Complete Graphs
In complete graphs, every vertex is connected to every other vertex by an edge.

```
import Embedding from '/src/graph/embedding/embedding.js';

Embedding.completeGraph(10, 400)
  .toSvg(400, 400, { verticesClasses: { '1': ['warning'], '2': ['error'], '3': ['warning', 'source'] } }));
```

![Complete Graph](readme/complete.jpg)![Same Complete Graph, with arc rather than segments](readme/complete_arcs.jpg)


## Complete Bipartite Graphs

In bipartite-complete graphs, there are two sets of vertices, set A and set B, and every vertex in A is connected to every in B by an edge.

```
import Embedding from '/src/graph/embedding/embedding.js';
import { range } from '/src/common/numbers.js';

let classes = {};
range(1, 7).forEach(i => classes[`${i}`] = ['left']);
range(7, 11).forEach(i => classes[`${i}`] = ['right']);

Embedding.completeBipartiteGraph(6, 4, 400)
  .toSvg(400, 400, { verticesClasses: classes }));
```

![Bipartite Complete Graph](readme/bipartite_complete.jpg)

## DAG

A DAG (Directed Acyclic Graph) is a kind of graph often used to model structured information, for instance for compilers, spreadsheets and electronic circuits design,  or inter-dependent events, like in Bayesian newtworks.

```
      let graph = new Graph();
      graph.createVertex('Start', {weight: 2});
      graph.createVertex('A');
      graph.createVertex('B', {weight: 1.5});
      graph.createVertex('C', {weight: 1.5});
      graph.createVertex('D', {weight: 1.5});
      graph.createVertex('E', {weight: 1.5});
      graph.createVertex('F', {weight: 2});
      graph.createVertex('G', {weight: 2});
      graph.createVertex('Finish', {weight: 2.5});
      graph.createEdge('Start', 'A', {label: 'design', weight: 2});
      graph.createEdge('A', 'B', {label: 'build body'});
      graph.createEdge('A', 'C', {label: 'build wheels'});
      graph.createEdge('A', 'D', {label: 'build frame'});
      graph.createEdge('A', 'E', {label: 'build engine'});
      graph.createEdge('B', 'F', {label: 'paint body'});
      graph.createEdge('D', 'G', {label: 'paint frame'});
      graph.createEdge('C', 'Finish', {label: 'mount wheels'});
      graph.createEdge('E', 'G', {label: 'mount engine on frame'});
      graph.createEdge('F', 'Finish', {label: 'mount body on frame'});
      graph.createEdge('G', 'Finish');

      let emb = new Embedding(graph);

      emb.setVertexPosition('Start', new Point2D(50, 200));
      emb.setVertexPosition('A', new Point2D(200, 200));
      emb.setVertexPosition('B', new Point2D(350, 50));
      emb.setVertexPosition('C', new Point2D(350, 150));
      emb.setVertexPosition('D', new Point2D(350, 250));
      emb.setVertexPosition('E', new Point2D(350, 350));
      emb.setVertexPosition('F', new Point2D(500, 100));
      emb.setVertexPosition('G', new Point2D(600, 300));
      emb.setVertexPosition('Finish', new Point2D(650, 200));

      let classes = {
        '"Start"': ['start'],
        '"Finish"': ['finish', 'body', 'wheels', 'frame', 'engine'],
        '"A"': ['init'],
        '"B"': ['build', 'body'],
        '"C"': ['build', 'wheels'],
        '"D"': ['build', 'frame'],
        '"E"': ['build', 'engine'],
        '"F"': ['paint', 'body'],
        '"F"': ['paint', 'frame'],
        '"G"': ['mount', 'body', 'frame', 'engine']
      };

      emb.toSvg(700, 400, { verticesClasses: classes });
```

![DAG](readme/dag.jpg)