import { choose } from "../common/array.mjs";
import { isFunction } from "../common/basic.mjs";
import { isNumber, toNumber } from "../../../common/numbers.mjs";
import { ERROR_MSG_INVALID_ARGUMENT } from "../../../common/errors.mjs";

export default function geneticAlgorithm(cost, crossover, mutationsList, randomIndividual, populationSize, maxSteps, verbose = true) {
  [maxSteps, populationSize] = validate(maxSteps, populationSize);

  let population = initPopulation(randomIndividual, populationSize);

  for (let i = 1; i <= maxSteps; i++) {
    const wheel = makeCrossoverWheel(population);
    // Elitism: save the best individual of the past generation
    const newPopulation = [wheel.getBest()];
    for (let i = 1; i < populationSize; i++) {
      const p = crossover.run(wheel.draw(), wheel.draw());
      for (let mutation of mutationsList) {
        mutation.run(p);
      }
      newPopulation.push(p);
    }
    population = newPopulation;
  }
  return getBest(population);
}

/**
 * @private
 */
class Individual {
  #chromosome;
  #cost;
  #costFunction;

  constructor(chromosome, costFunction) {
    this.#chromosome = chromosome;
    this.#costFunction = costFunction;
    this.#cost = costFunction(chromosome);
  }

  get chromosome() {
    return this.#chromosome;
  }

  get cost() {
    return this.#cost;
  }

  update(chromosome) {
    this.#chromosome = chromosome;
    this.#cost = this.#costFunction(chromosome);
  }
}

/**
 * @private
 */
class Operator {
  #ratio;
  #method;

  constructor(method, ratio) {
    if (!isNumber(ratio) || toNumber(ratio) < 0 || toNumber(ratio) > 1) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Operator', 'ratio', ratio));
    }

    this.#method = method;
    this.#ratio = toNumber(ratio);
  }

  get method() {
    return this.#method;
  }

  get ratio() {
    return this.#ratio;
  }
}

export class Crossover extends Operator {
  constructor(method, ratio) {
    super(method, ratio);
    // validate crossover method: takes 2 arguments
    if (!isFunction(method) || method.length !== 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Crossover', 'method', method));
    }
  }

  get run(p1, p2) {
    if (Math.random() < super.ratio) {
      return new Individual(super.#method(p1.chromosome, p2.chromosome), p1.costFunction);
    } else {
      return choose([p1, p2]);
    }
  }
}

export class Mutation extends Operator {
  constructor(method, ratio) {
    super(method, ratio);
    // validate mutation method: takes 1 argument
    if (!isFunction(method) || method.length !== 1) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Mutation', 'method', method));
    }
  }

  get run(p) {
    if (Math.random() < super.ratio) {
      // Apply the mutation
      return p.update(super.#method(p.chromosome));
    } else {
      // Do not apply the mutation and return the individual as-is
      return p;
    }
  }
}