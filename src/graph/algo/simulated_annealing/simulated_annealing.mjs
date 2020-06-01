import { isNumber, toNumber } from "../../../common/numbers.mjs";
import { ERROR_MSG_INVALID_ARGUMENT } from "../../../common/errors.mjs";

/**
 * @name simulatedAnnealing
 * @description
 * Perform simulated annealing optimization.
 *
 * @param {Function} cost A function taking a point in the problem space and returning the cost of that solution.
 * @param {Function} updateStep A function taking current point (in the problem space) and temperature, and returning a new candidate solution.
 * @param {Number} maxSteps The maximum number of optimization steps to be performed.
 * @param {*} P0 Starting solution: a point in the problem space.
 * @param {Number} T0 Initial temperature of the system. This value must be positive.
 * @param {Number} k The Boltzmann constant, used to adjust the acceptance probability of worse solutions. This value must be positive.
 * @param {Number} alpha The decay rate for the temperature: every 0.1% of the steps, the temperature will be update using the rule T = alpha*T.
 *                       This must be between 0 and 1 (both excluded).
 * @param {Boolean} verbose If true, prints a summary message at each iteration.
 *
 * @return {*} The point corresponding to the optimum found by the algorithm (be warned: it's NOT guaranteed that this is a global nor local minimum).
 */
export function simulatedAnnealing(cost, updateStep, maxSteps, P0, T0, k = 1, alpha = 0.98, verbose = true) {
  [maxSteps, T0, k, alpha] = validate(maxSteps, T0, k, alpha);
  // Update the temperature every 0.1% of the steps - a total of 1000 times
  const temperatureUpdateSteps = Math.max(1, Math.round(maxSteps / 1000));

  let T = T0;
  for (let i = 1; i <= maxSteps; i++) {
    T = temperatureUpdate(T, alpha, i, temperatureUpdateSteps);
    const P = updateStep(P0.slice(0), T);
    const delta = cost(P) - cost(P0);
    if (acceptTransition(delta, k, T)) {
      P0 = P;
    }
    if (verbose) {
      console.log(`It. ${i} | Temperature ${T} | delta ${delta} | Accepted? ${acceptTransition(delta, k, T)} | Cost ${cost(P0)} `)
    }
  }
  return P0;
}

/**
 * @name temperatureUpdate
 * @private
 * @description
 * Performs the temperature update, based on the stage of annealing and decay parameter.
 *
 * @param {Number} T The current temperature.
 * @param {Number} alpha The decay rate for temperature.
 * @param {Number} currentStep The current iteration.
 * @param {Number} tDelta The number of iterations between two updates of the temperature.
 *                        In other words, the temperature stays the same for tDelta iterations, then it's updated.
 *
 * @return {Number} The new temperature.
 */
function temperatureUpdate(T, alpha, currentStep, tDelta) {
  if (currentStep % tDelta === 0) {
    return alpha * T;
  } else {
    return T;
  }
}

/**
 * @name acceptTransition
 * @private
 * @description
 * Decides if the transition to a new state should be accepted or rejected. If the cost delta is positive, meaning that current state has a
 * cost higher than the new state, then the transition is always accepted. Otherwise, computes the probability of accepting a worse state (one with higher cost)
 * using Boltzmann distribution.
 *
 * @param {Number} costDelta The difference in cost between current position and the next attempted step.
 *                          If this is negative, it means that we are considering moving to a higher-energy state.
 * @param {Number} k The Boltzmann constant, used to adjust the acceptance probability of worse solutions. This value must be positive.
 * @param {Number} T Current system's temperature.
 *
 * @return {boolean} True if the transition is accepted, false otherwise.
 */
function acceptTransition(costDelta, k, T) {
  if (costDelta > 0) {
    return Math.exp(-costDelta / k / T) > Math.random();
  } else {
    return true;
  }
}

/**
 * @name validate
 * @private
 * @description
 * Validate the numeric inputs for the simulated annealing method.
 *
 * @param {Number} maxSteps The maximum number of optimization steps to be performed.
 * @param {Number} T0 Initial temperature of the system. This value must be positive.
 * @param {Number} k The Boltzmann constant, used to adjust the acceptance probability of worse solutions. This value must be positive.
 * @param {Number} alpha The decay rate for the temperature: every 0.1% of the steps, the temperature will be update using the rule T = alpha*T.
 */
function validate(maxSteps, T0, k, alpha) {
  if (!isNumber(maxSteps) || toNumber(maxSteps) <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('simulatedAnnealing', 'maxSteps', maxSteps));
  }
  if (!isNumber(T0) || toNumber(T0) <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('simulatedAnnealing', 'T0', T0));
  }
  if (!isNumber(k) || toNumber(k) <= 0) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('simulatedAnnealing', 'k', k));
  }
  if (!isNumber(alpha) || toNumber(alpha) <= 0 || toNumber(alpha) >= 1) {
    throw new Error(ERROR_MSG_INVALID_ARGUMENT('simulatedAnnealing', 'alpha', alpha));
  }

  return [toNumber(maxSteps), toNumber(T0), toNumber(k), toNumber(alpha)];
}