import {isUndefined} from '../common/basic.js';
import {isNumber, toNumber} from '../common/numbers.js';

const _version = new WeakMap();
const _storage = new WeakMap();

/** @module cache
  *
  * Key-value cache.
  */
class Cache {
  constructor() {
    _version.set(this, 0);
    _storage.set(this, new Map());
  }

  gets(key, version=0) {
    let result = null;
    version = toNumber(version);
    if (isNumber(version) && version <= _version.get(this)) {
      if (!isUndefined(key)) {
        let storage = _storage.get(this);
        if (storage.has(key)) {
          result = storage.get(key);
        }
      }
    }
    return result;
  }

  cas(key, value, version=0) {
    version = toNumber(version);
    if (!isNumber(version) || _version.get(this) > version || isUndefined(key)) {
      return false;
    } else {
      _version.set(this, version);
      _storage.get(this).set(key, value);
      return true;
    }
  }

  delete(key, version=0) {
    version = toNumber(version);
    if (!isNumber(version) || _version.get(this) > version || isUndefined(key)) {
      return false;
    } else {
      return _storage.get(this).delete(key);
    }
  }
}

export default Cache;