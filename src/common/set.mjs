export const setDifference = (set1, set2) =>
  new Set([...set1].filter((_) => !set2.has(_)));
