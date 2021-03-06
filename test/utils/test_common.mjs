import { size } from '../../src/common/basic.mjs';
import { setDifference } from '../../src/common/set.mjs';

import chai from "chai";
const expect = chai.expect;

export function testAPI(obj, expectedAttributes = [], expectedMethods = [], prototypeMethods = []) {
  expectedMethods.forEach(method => expect(obj).to.respondTo(method));

  let allExpectedProperties = new Set(expectedAttributes.concat(expectedMethods));
  let allProperties = new Set(Object.getOwnPropertyNames(Reflect.getPrototypeOf(obj)));

  expect([...setDifference(allProperties, allExpectedProperties)]).to.be.eql([]);
  expect([...setDifference(allExpectedProperties, allProperties)]).to.be.eql([]);

  if (prototypeMethods.length > 0) {
    let expectedPrototypeMethods = new Set(setDifference(
      new Set(Object.getOwnPropertyNames(Reflect.getPrototypeOf(Reflect.getPrototypeOf((obj))))),
      new Set(expectedMethods.concat(expectedAttributes))));

    prototypeMethods = new Set(prototypeMethods);
    expect([...setDifference(prototypeMethods, expectedPrototypeMethods)]).to.be.eql([]);
    expect([...setDifference(expectedPrototypeMethods, prototypeMethods)]).to.be.eql([]);
  }
}

export function testStaticAPI(klass, expectedMethods) {
  let allStaticMethods = new Set(Object.getOwnPropertyNames(klass).filter(prop => typeof klass[prop] === "function"));
  expect(allStaticMethods).to.eql(new Set(expectedMethods));
}

export function assertSetEquality(collection1, collection2) {
  expect([...setDifference(new Set(collection1), new Set(collection2))]).to.be.eql([]);
}

export function assertDeepSetEquality(collection, expected) {
  try {
    (collection instanceof Set).should.be.true();
    size(collection).should.eql(size(expected));

    for (const cc of collection) {
      (cc instanceof Set).should.be.true();
      [...expected].some(eCC => setDifference(cc, new Set(eCC)).size === 0).should.be.true();
    }
  } catch (e) {
    collection.should.eql(expected);
  }
}