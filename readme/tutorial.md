# JSGraphs Tutorial

There are two main entities that can be created in this library: graphs (class [_Graph_](../src/graph/graph.js)) and embeddings ([_Embedding_](../src/graph/embedding/embedding.js)).

The former focuses on modeling data and transforming it through algorithms, the latter is used to represent graphs on display (or paper!).

# Graph

A graph is a data structure that allow modeling interconnected data, where heterogeneous entities (the graph's vertices) can be in relation among them; these relations are modeled by graph's edges.

In _JsGraphs_, creating a graph is quite simple:

```javascript
import Graph from '/src/graph/graph.js';

let graph = new Graph();
```

The instance variable graph now has been created, without any vertex or edge. Of course, these entities are also modeled in the library:

```javascript
import Vertex from '/src/graph/vertex.js';

const v = new Vertex('vertex label', {weight: 3});
const u = new Vertex('u');
```

Vertices in _JsGraphs_ are immutable, hence `u` and `v` above are real consts. On creation, you must add a label for the vertex, and optionally a weight: the default weight for a vertex is 1, and generally you don't have to worry about this weight, but some graph applications can use it.

A vertex's label doesn't have to be a string, it can be any object that can be serialized to the `JSON` format: strings, numbers, arrays, plain JS objects, or custom objects that have a `toJson` method.

It is possible to use the `static` method `Vertex.isSerializable` to check if a value is a valid label:

```javascript
Vertex.isSerializable(1);   // true
Vertex.isSerializable('abc');   // true
Vertex.isSerializable([1, 2, true, 'a']);   // true
Vertex.isSerializable({a: [1, 2, 3], b: {x: -1, y: 0.5}});   // true
Vertex.isSerializable(new Vertex('test'));   // true, Vertex has a toJson() method
Vertex.isSerializable(new Graph());   // true!! Graph has a toJson() method

Vertex.isSerializable(new Map());   // false
Vertex.isSerializable(new Set());   // false
Vertex.isSerializable(() => true));   // false, functions can't be serialized to JSON
```

Existing vertices can be added to graphs: notice that it's NOT possible to add two vertices with the same label to the same graph.

```javascript
let graph = new Graph();
const v = new Vertex('vertex label', {weight: 3});
const u = new Vertex('u');

graph.addVertex(v);
graph.addVertex(u);
// graph.addVertex(new Vertex('u)) // ERROR, duplicated vertex 'u'
```

There is also a shortcut to create those vertices directly on the graph, without first creating them as a separate variable; besides being shorter, this way is also more efficient, because vertices (and edges) _added_ to a graph are actually cloned.

```javascript
let graph = new Graph();

const v = graph.createVertex(['I', 'am', 'a', 'valid', 'label'], {weight: 3});
const u = graph.createVertex('u');
// graph.createVertex('u) // ERROR, duplicated vertex 'u'
```

As you can see in the snippet above, `createVertex` (as well as `addVertex`) returns the ID of the vertex created (NOT a reference to the actual instance held by the graph).

Each vertex, in fact, has an `id` property that uniquely identifies it in a graph: as mentioned, this means that their label must be the same. This means that the IDs of two instances of `Vertex` can clash even if they are different objects, or if they have different properties.

```javascript
const u1 = new Vertex('u', {weight: 3});
const u2 = new Vertex('u');

console.log(u1.equals(u2));     // false
console.log(u1.id === u2.id);   // true
```

Though a