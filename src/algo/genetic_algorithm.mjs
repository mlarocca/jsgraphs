import { arrayMin, choose } from "../common/array.mjs";
import { isFunction } from "../common/basic.mjs";
import { isNumber, toNumber, randomInt, range } from "../common/numbers.mjs";
import { ERROR_MSG_INVALID_ARGUMENT } from "../common/errors.mjs";

/**
 *
 * @param {Function} fitnessFunction A function that takes a solution (i.e. a chromosome) and evaluates how good it is.
 *                                   In this implementation it's assumed that lower values means better fitness (in
 *                                   other words, we are trying to minimize the fitnessFunction).
 * @param {Crossover} crossover The crossover operator. It must be an instance of the `Crossover` class below.
 * @param {Array<Mutation>} mutationsList An array of `Mutation` instances: all of them will be applied (randomly, according to
 *                                        their probability of happening) to each simulated organism evolved from one
 *                                        generation to the next.
 * @param {Function} randomSolutionGenerator A function that generates a random solution for current problem.
 * @param {Number} populationSize The number of simulated organism that will be used.
 * @param {Number} maxSteps The number of evolutionary steps that the population will undergo.
 * @param {Function} solutionCloner A function that deep clones solutions. This is necessary to allow implementing
 *                                  GA as a generic template, an optimization meta-algorithm that can be customized:
 *                                  since we don't know in advance what a chromosome will hold, we need the user to
 *                                  provide the best method for deep copying it.
 *                                  Default: it invokes method clone on the solution's object.
 * @param {Boolean} verbose If true, prints a summary message at each iteration. Default: false.
 */
export default function geneticAlgorithm(
  fitnessFunction,
  crossover,
  mutationsList,
  randomSolutionGenerator,
  populationSize,
  maxSteps,
  solutionCloner = (solution) => solution.clone(),
  verbose = false) {

  [maxSteps, populationSize] = validate(maxSteps, populationSize);

  // Helper function, a shortcut to create new individuals, basically currying Individual's constructor
  const createIndividual = (chromosome) => new Individual(chromosome, fitnessFunction, solutionCloner);

  let population = initPopulation(randomSolutionGenerator, populationSize, createIndividual);

  for (let i = 1; i <= maxSteps; i++) {
    const pool = new MatingPool(population);

    if (verbose) {
      console.log(`It. ${i} | Best Cost ${pool.best.fitness}`);
    }

    // Elitism: save the best individual of the past generation
    const newPopulation = [pool.best];

    // Now fills the other positions with individuals through mating
    // Low-fitness solutions (meaning ) will have a lower chance to get carried over, but still a non-zero chance
    for (let i = 1; i < populationSize; i++) {
      const p = crossover.run(pool.select(), pool.select(), createIndividual);
      for (let mutation of mutationsList) {
        mutation.run(p);
      }
      newPopulation.push(p);
    }
    population = newPopulation;
  }
  return findBestFit(population).chromosome;
}

/**
 * @name
 * @private
 * @description
 *
 * @param population
 */
function findBestFit(population) {
  return arrayMin(population, { key: (p) => p.fitness }).value;
}

/**
 * @name
 * @private
 * @description
 *
 * @param randomChromosome
 * @param populationSize
 * @param createIndividual
 */
function initPopulation(randomChromosome, populationSize, createIndividual) {
  // Set the fitness function as a static property of the (private) class.
  const population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(createIndividual(randomChromosome()));
  }
  return population;
}

/**
 * @name validate
 * @private
 * @description
 * Validate the numeric inputs for the genetic algorithm.
 *
 * @param {Number} maxSteps The maximum number of optimization steps to be performed.
 * @param {Number} populationSize The number of individuals to evolve.
 */
function validate(maxSteps, populationSize) {
  if (!isNumber(maxSteps) || toNumber(maxSteps) <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('geneticAlgorithm', 'maxSteps', maxSteps));
  }
  if (!isNumber(populationSize) || toNumber(populationSize) < 1) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('geneticAlgorithm', 'T0', populationSize));
  }

  return [toNumber(maxSteps), toNumber(populationSize)];
}

/**
 * @class Individual
 * @private
 * @description
 * Models a single member of the population to evolve.
 */
class Individual {
  // The genetic material of the individual. This changes depending on the actual problem we solve
  #chromosome;
  // The fitness of this organism. In this implementation it's assumed to be a cost function, i.e. a function to be minimized.
  #fitness;
  // A flag used to compute the fitness function only when strictly necessary.
  #dirty;

  #fitnessFunction;
  #cloneChromosome;

  constructor(chromosome, fitnessFunction, cloneChromosome) {
    this.#chromosome = cloneChromosome(chromosome);
    this.#dirty = true;
    this.#fitnessFunction = fitnessFunction;
    this.#cloneChromosome = cloneChromosome;
  }

  get chromosome() {
    return this.#cloneChromosome(this.#chromosome);
  }

  /**
   * @method fitness
   * @for Individual
   * @description
   *
   * Returns a measure of how fit is this organism (in current simulated environment).
   * If this instance has not been changed since last time its fitness was accessed, it avoids recomputing its value.
   *
   * @return {Number} The organism's fitness.
   */
  get fitness() {
    if (this.#dirty) {
      this.#fitness = this.#fitnessFunction(this.#chromosome);
      this.#dirty = false;
    }
    return this.#fitness;
  }

  /**
   * @method update
   * @for Individual
   * @description
   *
   * Updates the genome of the individual. It also sets the dirty flag, so its fitness will have to be computed
   * again next time it's requested.
   *
   * @param {*} chromosome The new chromosome to set for this organism.
   */
  update(chromosome) {
    this.#chromosome = this.#cloneChromosome(chromosome);
    this.#dirty = true;
  }

  /**
   * @method clone
   * @for Individual
   * @description
   *
   * Clones this organism. Makes sure that the chromosome is deeply copied, to avoid shared references.
   *
   * @return {Individual} A new individual, carrying the same genetic material.
   */
  clone() {
    return new Individual(this.#chromosome, this.#fitnessFunction, this.#cloneChromosome);
  }
}

/**
 * @class MatingPool
 * @description
 *
 * A helper class that takes in a population, and mimics the selection factor in Uses tournament selection
 */
class MatingPool {
  #population;
  #n;

  constructor(population) {
    this.#population = population;
    this.#n = population.length;
    this.best = findBestFit(population);
  }

  select() {
    // Randmly selects 5 individuals;
    const pool = range(0, 3).map(() => this.#population[randomInt(0, this.#n)]);

    // Only the best one wins
    return findBestFit(pool);
  }
}

/**
 * @private
 */
class Operator {
  #ratio;
  #operation;

  constructor(operation, ratio) {
    if (!isNumber(ratio) || toNumber(ratio) < 0 || toNumber(ratio) > 1) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Operator', 'ratio', ratio));
    }

    this.#operation = operation;
    this.#ratio = toNumber(ratio);
  }

  get operation() {
    return this.#operation;
  }

  get ratio() {
    return this.#ratio;
  }
}

export class Crossover extends Operator {
  constructor(operation, ratio) {
    super(operation, ratio);
    // validate crossover method: takes 2 arguments
    if (!isFunction(operation) || operation.length !== 2) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Crossover', 'operation', operation));
    }
  }

  run(p1, p2, createIndividual) {
    if (Math.random() < super.ratio) {
      return createIndividual(super.operation(p1.chromosome, p2.chromosome));
    } else {
      return choose([p1, p2]).clone();
    }
  }
}

export class Mutation extends Operator {
  constructor(operation, ratio) {
    super(operation, ratio);
    // validate mutation method: takes 1 argument
    if (!isFunction(operation) || operation.length !== 1) {
      throw new Error(ERROR_MSG_INVALID_ARGUMENT('Mutation', 'operation', operation));
    }
  }

  run(p) {
    if (Math.random() < super.ratio) {
      // Apply the mutation
      return p.update(super.operation(p.chromosome));
    } else {
      // Do not apply the mutation and return the individual as-is
      return p;
    }
  }
}