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
  .toSvg(400, 400, {'1': ['warning'], '2': ['error'], '3': ['warning', 'source']}));
```

![Complete Graph](readme/complete.jpg)


## Complete Bipartite Graphs

In bipartite-complete graphs, there are two sets of vertices, set A and set B, and every vertex in A is connected to every in B by an edge.

```
import Embedding from '/src/graph/embedding/embedding.js';
import { range } from '/src/common/numbers.js';

let classes = {};
range(1, 7).forEach(i => classes[`${i}`] = ['left']);
range(7, 11).forEach(i => classes[`${i}`] = ['right']);

Embedding.completeBipartiteGraph(6, 4, 400)
  .toSvg(400, 400, classes));
```

![Bipartite Complete Graph](readme/bipartite_complete.jpg)