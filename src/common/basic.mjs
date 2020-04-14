import { ERROR_MSG_TOO_FEW_ARGUMENTS } from './errors.mjs';

/**
 * @name isObject
 * @description
 * Check if the input is a non null object.
 *
 * @param maybeObject
 * @returns {boolean}
 */
export function isObject(maybeObject) {
  return typeof maybeObject === 'object' && maybeObject !== null;
}

/**
 * @name isPlainObject
 * @description
 * Check if the input is a non null plain JavaScript object (versus an instance of a class).
 *
 * @param maybeObject
 * @returns {boolean}
 */
export function isPlainObject(maybeObject) {
  return isObject(maybeObject) && maybeObject.constructor === Object;
}

/**
 * @name isFunction
 * @description
 * Check if the input is a function.
 *
 * @param maybeFunction
 * @returns {boolean}
 */
export function isFunction(maybeFunction) {
  return typeof maybeFunction === 'function';
}

/**
 * @name isUndefined
 * @description
 * Check if the input is undefined.

 * @param maybeUndefined The value to check.
 * @returns {boolean} true iff `maybeUndefined` is undefined.
 * @throws {TypeError(ERROR_MSG_TOO_FEW_ARGUMENTS)} if no argument is passed
 *
 */
export function isUndefined(maybeUndefined) {
  return (
    maybeUndefined === void 0 &&
    checkArgumentsLength(arguments, 1, 'isUndefined')
  );
}

/**
 * @name isDefined
 * @description
 * Check if the input is undefined or null.

 * @param maybeDefined The value to check.
 * @returns {boolean} true iff `maybeDefined` is NOT undefined nor null.
 * @throws {TypeError(ERROR_MSG_TOO_FEW_ARGUMENTS)} if no argument is passed
 *
 */
export function isDefined(maybeDefined) {
  return maybeDefined !== null && !isUndefined(maybeDefined);
}

/**
 * @name isDefined
 * @description
 * Check if the argument is an iterable.
 *
 * @param {*} maybeIterable The value to check.
 * @returns {boolean} true iff `maybeIterable` is an iterable.
 */
export function isIterable(maybeIterable) {
  return (
    (isObject(maybeIterable) || isFunction(maybeIterable)) &&
    typeof maybeIterable[Symbol.iterator] === 'function'
  );
}

/**
 * @name isBoolean
 * @description
 * Check if the input is a valid boolean.

 * @param maybeBoolean The value to check.
 * @returns {boolean} true iff `maybeBoolean` is either `true` or `false`.
 *
 */
export function isBoolean(maybeBoolean) {
  return maybeBoolean === true || maybeBoolean === false;
}

/**
 * Identity function.
 * @param {*} _ Anything.
 * @return {*} The function's argument.
 */
export const identity = (_) => _;

let checkArgumentsLength = (args, expectedArgsLength, fname) => {
  if (args.length >= expectedArgsLength) {
    return true;
  } else {
    throw new TypeError(
      ERROR_MSG_TOO_FEW_ARGUMENTS(fname, expectedArgsLength, args.length)
    );
  }
};
