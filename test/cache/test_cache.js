import Cache from '../../src/cache/cache.js';
import {testAPI} from '../utils/test_common.js';

const should = require('should');
const chai = require('chai');
const expect = chai.expect;

describe('Cache API', () => {

  it('# Class should have a constructor method', function () {
    Cache.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let cache = new Cache();
    let methods = ['constructor', 'gets', 'cas', 'delete'];
    let attributes = [];
    testAPI(cache, attributes, methods);
  });
});

describe('Methods', () => {
  describe('gets()', () => {
    var cache;

    beforeEach(function () {
      cache = new Cache();
    });

    it('# should return null if the element is not in cache', () => {
      should.not.exists(cache.gets(1));
      should.not.exists(cache.gets('1'));
    });

    it('# should return the value set for the element if present', () => {
      cache.cas(1, 3.1415);
      cache.gets(1).should.equal(3.1415);
    });

    it('# should not ignore key type', () => {
      cache.cas(1, 'afdsdf');
      cache.gets(1).should.equal('afdsdf');
      expect(cache.gets('1')).to.be.eql(null);
    });

    it('# should ignore obsolete versions', () => {
      cache.cas(1, [], 1);
      cache.gets(1, 0).should.eql([]);
      cache.gets(1, 1).should.eql([]);
      cache.gets(1, '1').should.eql([]);
      expect(cache.gets(1, 2)).to.be.eql(null);
      expect(cache.gets(1, '2')).to.be.eql(null);
    });

    it('# should ignore non numeric versions', () => {
      cache.cas(1, 'a', 1);
      expect(cache.gets(1, 'a')).to.be.eql(null);
      expect(cache.gets(1, true)).to.be.eql(null);
      expect(cache.gets(1, false)).to.be.eql(null);
      expect(cache.gets(1, {})).to.be.eql(null);
    });
  });

  describe('cas()', () => {
    let cache;

    beforeEach(function () {
      cache = new Cache();
    });

    it('# should return true when a result is written', () => {
      cache.cas(1, 'a').should.eql(true);
      cache.cas('1', 'a').should.eql(true);
    });

    it('# should support several types for keys', () => {
      let keyValues = [
        [false, 'a'],
        [true, 12],
        [{}, [1]],
        [{'a': 1}, new Date()],
        [[1, 2 , 3], 3.1415],
        [null, undefined]
      ];

      for (let [key, value] of keyValues) {
        cache.cas(key, value).should.eql(true);
        expect(cache.gets(key)).to.be.eql(value);
      }
    });

    it('# should return false for invalid keys', () => {
      cache.cas(undefined, 'a').should.eql(false);
    });

    it('# should return false for invalid versions', () => {
      cache.cas(1, 'a', 'invalid').should.eql(false);
      cache.cas(1, 'a', null).should.eql(false);
      cache.cas(1, 'a', []).should.eql(false);
      cache.cas(1, 'a', {}).should.eql(false);
    });

    it('# should return false for stale versions', () => {
      cache.cas(1, 'a', 1).should.eql(true);
      cache.cas(1, 'b', 0).should.eql(false);
      cache.gets(1).should.equal('a');
      cache.cas(1, 'c', 2).should.eql(true);
      cache.gets(1).should.equal('c');
    });
  });

  describe('delete()', () => {
    let cache;

    beforeEach(function () {
      cache = new Cache();
    });

    it('# should return true when a result is deleted', () => {
      cache.cas(1, 'a').should.eql(true);
      cache.cas('1', 'a').should.eql(true);
      cache.gets(1).should.eql('a');
      cache.gets('1').should.eql('a');
      cache.delete('1').should.eql(true);
      cache.gets(1).should.eql('a');
      expect(cache.gets('1')).to.be.eql(null);
    });

    it('# should return false for invalid keys', () => {
      cache.delete(undefined).should.eql(false);
    });

    it('# should return false for invalid versions', () => {
      cache.cas(1, 'a').should.eql(true);
      cache.delete(1, 'invalid').should.eql(false);
      cache.delete(1,  null).should.eql(false);
      cache.delete(1, []).should.eql(false);
      cache.delete(1, {}).should.eql(false);
    });

    it('# should return false for stale versions', () => {
      cache.cas(1, 'a', 1).should.eql(true);
      cache.delete(1, 0).should.eql(false);
      cache.gets(1).should.eql('a');
      cache.delete(1, 1).should.eql(true);
      expect(cache.gets('1')).to.be.eql(null);
    });
  });
});