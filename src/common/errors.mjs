/**
 * COMMON ERROR MESSAGES
 */
export const ERROR_MSG_INVALID_ARGUMENT = (methodName, argName, argValue) =>
  `Invalid argument ${argName} = ${argValue} for ${methodName}`;
export const ERROR_MSG_ARGUMENT_TYPE = (fname, pname, val, type) =>
  `Illegal argument for ${fname}: ${pname} = ${val} must be a ${type}`;
export const ERROR_MSG_METHOD_UNIMPLEMENTED = (method) =>
  `Method ${method} is yet to be implemented`;
export const ERROR_MSG_PARAM_UNDEFINED = (fname, pname) =>
  `Illegal argument for ${fname}: ${pname} must be defined`;
export const ERROR_MSG_PARAM_EMPTY_ARRAY = (fname, pname) =>
  `Illegal argument for ${fname}: array ${pname} is empty`;
export const ERROR_MSG_TOO_FEW_ARGUMENTS = (fname, expected, actual) =>
  `Not enough arguments for ${fname}: received ${actual} instead of ${expected}`;
export const ERROR_MSG_INDEX_OUT_OF_BOUNDARIES = (fname, pname, i) =>
  `Index out of boudaries in ${fname} for ${pname}: ${i}`;
export const ERROR_MSG_POSITION_OUT_OF_BOUNDARIES = (fname, pname, i) =>
  `Position out of boudaries in ${fname} for ${pname}: ${i}`;
export const ERROR_MSG_INVALID_DISTANCE = (fname, val, pname = 'distance') =>
  `Illegal argument for ${fname}: ${pname} = ${val} must be a valid distance (a non-negative number)`;
export const ERROR_MSG_INVALID_DIMENSION_INDEX = (
  fname,
  val,
  dimensionality = 1
) =>
  `Illegal argument for ${fname}: the dimension index must be an integer between 0 and ${
    dimensionality - 1
  }, instead ${val} was passed`;
export const ERROR_MSG_PARAM_TYPE = (fname, pname, val, type) =>
  `Illegal argument for ${fname}: ${pname} = ${val} must be a ${type}`;
//numbers
export const ERROR_MSG_RANGE_LOWER = (fname, val) =>
  `Illegal argument for ${fname}: a = ${val} must be a SafeInteger`;
export const ERROR_MSG_RANGE_UPPER = (fname, val) =>
  `Illegal argument for ${fname}: b = ${val} must be a SafeInteger`;
export const ERROR_MSG_RANGE_STEP = (fname, val) =>
  `Illegal argument for ${fname}: step = ${val} must be a positive SafeInteger`;
export const ERROR_MSG_RANGE_BOUNDARIES = (fname, a, b) =>
  `Illegal argument for ${fname}: must be a <[=] b, but ${a} >[=] ${b}`;
export const ERROR_MSG_RANGE_TOO_LARGE = (fname, a, b) =>
  `Illegal argument for ${fname}: range [${a}, ${b}] is too large to be allocated`;
//strings
export const ERROR_MSG_RANDOM_STRING_LENGTH = (val) =>
  `Illegal argument for randomString: length = ${val} must be a non-negative SafeInteger`;
export const ERROR_MSG_RANDOM_STRING_TOO_LARGE = (val) =>
  `Illegal argument for randomString: length ${val} is too large to be allocated`;
// graph
export const ERROR_MSG_INVALID_LABEL = (fname, val) =>
  `Invalid label in method ${fname}: ${val} is not JSON-serializable`;
export const ERROR_MSG_INVALID_EDGE_LABEL = (fname, val) =>
  `Invalid label in method ${fname}: ${val}. Edge labels must be strings.`;
export const ERROR_MSG_EDGE_NOT_FOUND = (fname, val) =>
  `Illegal parameter for ${fname}: Edge ${val} not in graph`;
export const ERROR_MSG_VERTEX_NOT_FOUND = (fname, val) =>
  `Illegal parameter for ${fname}: Vertex ${val} not in graph`;
export const ERROR_MSG_VERTEX_DUPLICATED = (fname, val) =>
  `Illegal argument for  ${fname}: v = ${val}: is already in the graph.`;
export const ERROR_MSG_DIJKSTRA_NEGATIVE_EDGE =
  "Cannot apply Dijkstra's Algorithm to this graph: negative edge(s) found";
export const ERROR_MSG_BELLMANFORD_NEGATIVE_CYCLE =
  "Cannot apply Bellman-Ford's Algorithm to this graph: a negative cycle has been found";
export const ERROR_MSG_FLOYDWARSHALL_NEGATIVE_CYCLE =
  "Cannot apply Floyd-Warshall's Algorithm to this graph: a negative cycle has been found";
export const ERROR_MSG_GEM_MAXROUNDS =
  'Illegal argument for gem method: maxRounds must be a positive integer';
export const ERROR_MSG_GEM_VIEWWIDTH =
  'Illegal argument for gem method: viewWidth must be a positive integer';
export const ERROR_MSG_GEM_VIEWHEIGHT =
  'Illegal argument for gem method: viewHeight must be a positive integer';
export const ERROR_MSG_KARGER =
  'Illegal argument for Karger method: runs must be a positive integer';
export const ERROR_MSG_EDMONDSKARP =
  'Illegal argument for Edmonds-Karp method: source and sink must be valid vertices';
export const ERROR_MSG_CONNECTTO_ILLEGAL_GRAPH_PARAM =
  "Illegal argument for connecTo: 'other' must be a Graph";
export const ERROR_MSG_CONNECTTO_ILLEGAL_EDGES_PARAM =
  "Illegal argument for connectTo: 'edges' must be an array of edges";
export const ERROR_MSG_CONNECTTO_VERTICES_COLLISION =
  "At least one vertex in 'other' already belongs to this graph";
export const ERROR_MSG_COORDINATES_NOT_FOUND = (fname, vertex) =>
  `Method ${fname}: No coordinates passed for vertex ${vertex}`;
