# JSGraphs Tutorial

There are two main entities that can be created in this library: graphs (class [_Graph_](../src/graph/graph.js)) and embeddings ([_Embedding_](../src/graph/embedding/embedding.js)).

The former focuses on modeling data and transforming it through algorithms, the latter is used to represent graphs on display (or paper!).

# Graph

A graph is a data structure that allow modeling interconnected data, where heterogeneous entities (the graph's vertices) can be in relation among them; these relations are modeled by graph's edges.

In _JsGraphs_, creating a graph is quite simple:

```javascript
import Graph from '/src/graph/graph.mjs';

let graph = new Graph();
```

The instance variable graph now has been created, without any vertex or edge. Of course, these entities are also modeled in the library:

## Vertices

Class [`Vertex`](../src/graph/vertex.js) implement the first basic component of any graph, in turn modeling the entities (data) part of a graph.

```javascript
import Vertex from '/src/graph/vertex.mjs';

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

There is also a shortcut to create those vertices directly on the graph, without first creating them as a separate variable; besides being shorter, this way is also more efficient, because vertices (and edges) _added_ to a graph are actually cloned beforehand (meaning that, in the example above, a clone of `v` and `u` is actually added to `graph`).

```javascript
let graph = new Graph();

const vId = graph.createVertex(['I', 'am', 'a', 'valid', 'label'], {weight: 3});
const uId = graph.createVertex('u');
// graph.createVertex('u) // ERROR, duplicated vertex 'u'
```

As you can see in the snippet above, `createVertex` (as well as `addVertex`) returns the ID of the vertex created (NOT a reference to the actual instance held by the graph).

Each vertex, in fact, has an `id` property that uniquely identifies it in a graph: as mentioned, there can't be two vertices with the same label, so there is a 1:1 correspondence between labels and IDs. This means that the IDs of two instances of `Vertex` can clash even if they are different objects, or if they have different properties.

```javascript
const u1 = new Vertex('u', {weight: 3});
const u2 = new Vertex('u');

console.log(u1.equals(u2));     // false
console.log(u1.id === u2.id);   // true
```

You might want to hold to the id of a vertex, because you will need it to retrieve a reference to the actual vertex from the graph, and even to create a new edge (as we'll see in the next section).

```javascript
const u = graph.getVertex(uId);
const v = graph.getVertex(vId);
```

Most of the methods on graphs can take either an id, or a copy of the object to retrieve (namely a vertex or an edge).
For instance:

```javascript
graph.getVertex(uId);
graph.getVertex(graph.getVertex(uId));
```

both work and return a reference to vertex `u` (although only one does it efficiently!).

Once you get ahold of a reference to a graph's vertex, you can read all its fields, but you can only update its weight.


>  Although having vertices as perfectly immutable entities would have been desirable, this would have had repercussions on the performance of the graph, because updating a vertex `v`'s weight would have meant replacing `v` in the graph with a new instance of `Vertex`, and also updating all the references to `v` in (potentially, up to ) all the edges in the graph.
As a compromise, a vertex' label and id are kept immutable and impossible to change, while weight is mutable. Similar compromises will be made for embedded vertices and edges.
Switching to `TypeScript`, or whenever a future `EcmaScript` specification will include protected fields, would allow for more flexibility and possibly this aspect will be reviewed. For now, changing the mutable attributes of a graph's vertices and edges directly is **discouraged**: the **forward-compatible** way is going to be changing them through the `Graph` and `Embedding`'s methods.


## Edges

The other fundamental entity on which graphs are based are _edges_, implemented in class [`Edge`](../src/graph/edge.js).

[...]