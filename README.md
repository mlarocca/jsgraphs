# jsgraphs
A lightweight library to model graphs, run graphs' algorithms, and display them on screen.

# Installation

From the base folder:

```bash
nvm install stable

npm install
```


# Run tests

From the base folder:

```bash
npm t test/$FOLDER/$TEST
```

For instance

```bash
npm t test/geometric/test_point.js
```

# Examples

The library allows to create arbitrary graphs, but also
Graphs can be embedded in the plane, vertices can be positioned arbitrarily, and both vertices and edges can be styled individually.

## Complete Graphs
In complete graphs, every vertex is connected to every other vertex by an edge.

```javascript
import Embedding from '/src/graph/embedding/embedding.js';

Embedding.completeGraph(10, 400)
  .toSvg(400, 400, { verticesClasses: { '1': ['warning'], '2': ['error'], '3': ['warning', 'source'] } }));
```

![Complete Graph](readme/complete.jpg)![Same Complete Graph, with arc rather than segments](readme/complete_arcs.jpg)


## Complete Bipartite Graphs

In bipartite-complete graphs, there are two sets of vertices, set A and set B, and every vertex in A is connected to every in B by an edge.

```javascript
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

```javascript
  import Embedding from '/src/graph/embedding/embedding.js';
  import Graph from '/src/graph/graph.js';

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

## RegEx Finite State Automaton

Every **reg**ular **ex**pression can be translated to an _FSA_ (**F**inite **S**tate **A**utomaton), which in turn can be represented using a directed graph.

This example shows a regular expression for email validation: note that it intentionally uses a simpler regex than the most generic one, accepting only  a subset of all valid emails.

```javascript
  import Embedding from '/src/graph/embedding/embedding.js';
  import Graph from '/src/graph/graph.js';

  let graph = new Graph();
  const start = graph.createVertex('Start', { weight: 2 });
  const end = graph.createVertex('End', { weight: 2 });
  const s0 = graph.createVertex('S0');
  const s1 = graph.createVertex('S1');
  const s2 = graph.createVertex('S2');
  const s3 = graph.createVertex('S3');
  const s4 = graph.createVertex('S4');
  const s5 = graph.createVertex('S5');

  graph.createEdge(start, s0, { weight: 3 });
  graph.createEdge(s0, s1, { label: "[a-z0-9]" });
  graph.createEdge(s1, s1, { label: "[a-z0-9_\-]" });
  graph.createEdge(s1, s2, { label: "@" });
  graph.createEdge(s2, s3, { label: "[a-z0-9]" });
  graph.createEdge(s3, s3, { label: "[a-z0-9_\-]" });
  graph.createEdge(s3, s4, { label: "." });
  graph.createEdge(s4, s5, { label: "[a-z0-9]" });
  graph.createEdge(s5, s5, { label: "[a-z0-9_\-]" });
  graph.createEdge(s5, s4, { label: "." });
  graph.createEdge(s5, end, { label: ' ' });

  let emb = new Embedding(graph, new Map(), { width: 700, height: 400 });

  emb.setVertexPosition(start, new Point2D(50, 200));
  emb.setVertexPosition(s0, new Point2D(200, 300));
  emb.setVertexPosition(s1, new Point2D(200, 100));
  emb.setVertexPosition(s2, new Point2D(350, 300));
  emb.setVertexPosition(s3, new Point2D(350, 100));
  emb.setVertexPosition(s4, new Point2D(500, 300));
  emb.setVertexPosition(s5, new Point2D(500, 100));
  emb.setVertexPosition(end, new Point2D(650, 200));

  let classes = {
    [start.id]: ['start'],
    [end.id]: ['end'],
  };
  emb.toSvg(700, 400, { graphCssClasses: ['FSA'],  verticesCssClasses: classes });
```

![DAG](readme/regex_fsa.jpg)