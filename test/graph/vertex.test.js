import 'mjs-mocha';

import Vertex from '../../src/graph/vertex.js';
import Edge from '../../src/graph/edge.js';
import {choose, compareAsSets} from '../../src/common/array.js';
import {ERROR_MSG_INVALID_ARGUMENT} from '../../src/common/errors.js'
import {consistentStringify} from '../../src/common/strings.js';
import {testAPI} from '../utils/test_common.js';

import chai from "chai";
import should from "should";
const expect = chai.expect;

describe('Vertex API', () => {

  it('# Class should have a constructor method', function () {
    Vertex.should.be.a.constructor();
  });

  it('# Object\'s interface should be complete', () => {
    let vertex = new Vertex(1);
    let methods = ['constructor', 'edgeTo', 'addEdge', 'addEdgeTo', 'removeEdge', 'removeEdgeTo', 'equals', 'labelEquals', 'toJson'];
    let attributes = ['label', 'size', 'outDegree', 'outgoingEdges'];
    testAPI(vertex, attributes, methods);
  });
});

describe('Vertex Creation', () => {
  describe('# Parameters', () => {
    describe('# 1st argument (mandatory)', () => {
      it('should throw when label is null or undefined', () => {
        (() => new Vertex(null)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'label', null));
        (() => new Vertex(undefined)).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'label', undefined));
      });

      it('should NOT throw with other types', () => {
        (() => new Vertex(3)).should.not.throw();
        (() => new Vertex('2')).should.not.throw();
        (() => new Vertex([])).should.not.throw();
        (() => new Vertex({})).should.not.throw();
        (() => new Vertex(false)).should.not.throw();
        (() => new Vertex(new Map())).should.not.throw();
      });
    });

    describe('# 2nd argument (optional)', () => {
      it('should default to size=1', () => {
        new Vertex(2).size.should.eql(1);
      });

      it('should throw when size is not (parsable to) a number', () => {
        (() => new Vertex(1, {size: null})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'size', null));
        (() => new Vertex('1', {size: 'a'})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'size', 'a'));
        (() => new Vertex([1, 2, 3], {size: new Map()})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'size', new Map()));
      });

      it('should NOT throw with numbers and numeric strings', () => {
        (() => new Vertex(1, {size: 0})).should.not.throw();
        (() => new Vertex(1, {size: 1})).should.not.throw();
        (() => new Vertex(1, {size: -1})).should.not.throw();
        (() => new Vertex(1, {size: 3.14})).should.not.throw();
        (() => new Vertex(1, {size: -1.5e7})).should.not.throw();
        (() => new Vertex(1, {size: '0'})).should.not.throw();
        (() => new Vertex(1, {size: '1'})).should.not.throw();
        (() => new Vertex(1, {size: '-1'})).should.not.throw();
        (() => new Vertex(1, {size: '3.14'})).should.not.throw();
        (() => new Vertex(1, {size: '-1.5e7'})).should.not.throw();
      });
    });

    describe('# 3rd argument (optional)', () => {
      it('should default to outgoingEdges=[]', () => {
        new Vertex('2').outDegree.should.eql(0);
      });

      it('should throw if it\'s not an array', () => {
        (() => new Vertex(3, {outgoingEdges:'r'})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', 'r'));
        (() => new Vertex(3, {outgoingEdges: new WeakMap()})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', new WeakMap()));
        (() => new Vertex(3, {outgoingEdges:false})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', false));
        (() => new Vertex(3, {outgoingEdges:{}})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', {}));
      });

      it('should throw if array\'s elements are not edges', () => {
        (() => new Vertex(3, {outgoingEdges: ['r']})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', ['r']));
        (() => new Vertex(3, {outgoingEdges: [1, 2, 3]})).should.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', [1, 2, 3]));
      });

      it('should throw if any edge has a source different from array\'s elements are edges', () => {
        expect(() => new Vertex(2, {outgoingEdges: [new Edge(1, 2)]})).to.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', [new Edge(1, 2)]));
        expect(() => new Vertex(2, {outgoingEdges: [new Edge('2', 'b'), new Edge(2, 'adhg')]})).to.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex constructor', 'outgoingEdges', [new Edge('2', 'b'), new Edge(2, 'adhg')]));
      });

      it('should NOT throw with an empty array', () => {
        expect(() => new Vertex(2, {outgoingEdges: []})).not.to.throw();
      });

      it('should NOT throw with a valid edges array', () => {
        expect(() => new Vertex(2, {outgoingEdges: [new Edge(2, 2)]})).not.to.throw();
        expect(() => new Vertex(2, {outgoingEdges: [new Edge(2, 'a')]})).not.to.throw();
        expect(() => new Vertex({a:2}, {outgoingEdges: [new Edge({a:2}, 'a'), new Edge({a:2}, 'b')]})).not.to.throw();
      });

      it('should NOT throw if the edges array has duplicates', () => {
        expect(() => new Vertex({a:2}, {outgoingEdges: [new Edge({a:2}, 'a'), new Edge({a:2}, 'a')]})).not.to.throw();;
      });
    });
  });
});


describe('Attributes', () => {
  const labels =  [1, '65.231', 'adbfhs', false, [], {a: 'x'}, new Map(), (a, b) => 1];

  describe('label', () => {
    it('# should return the correct value for label', () => {
      labels.forEach(label => {
        let v = new Vertex(label, 1);
        v.label.should.eql(label);
      });
    });
  });

  describe('size', () => {
    const sizes = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return the correct weight', () => {
      sizes.forEach(s => {
        let v = new Vertex(choose(labels), {size: s});
        v.size.should.eql(Number.parseFloat(s));
      });
    });
  });

  describe('outDegree', () => {
    it('# should return the value of outgoing edges', () => {
      let u = new Vertex('source');
      let v = new Vertex(1);
      let w = new Vertex(2);
      u.addEdgeTo(v, {edgeLabel: 'e1'});
      u.outDegree.should.eql(1);
      u.addEdgeTo(v, {edgeLabel: 'e2'});
      //should not count multi-edges as separate
      u.outDegree.should.eql(1);
      u.addEdgeTo(w, {edgeLabel: 'e3'});
      u.outDegree.should.eql(2);
      u.addEdgeTo(u, {edgeLabel: 'e4'});
      // Should count loops
      u.outDegree.should.eql(3);
      u.addEdgeTo(v, {edgeLabel: 'e1B'});
      // replacing an edge should not change out degree
      u.outDegree.should.eql(3);
    });
  });

  describe('outgoingEdges', () => {
    describe('Simple Graph', () => {
      it('# should return (only) the last edge added to each destination', () => {
        let u = new Vertex('source');
        let v = new Vertex(1);
        let w = new Vertex(2);
        let e1 = u.addEdgeTo(v, {edgeLabel: 'e1'});
        compareAsSets(u.outgoingEdges, [e1], e => e.toJson()).should.be.true();
        let e2 = u.addEdgeTo(v, {edgeLabel: 'e2'});
        //should only return the last edge to a destination
        compareAsSets(u.outgoingEdges, [e2], e => e.toJson()).should.be.true();
        let e3 = u.addEdgeTo(w, {edgeLabel: 'e3'});
        compareAsSets(u.outgoingEdges, [e2, e3], e => e.toJson()).should.be.true();
        let e4 = u.addEdgeTo(u, {edgeLabel: 'e4'});
        // Should count loops
        compareAsSets(u.outgoingEdges, [e2, e3, e4], e => e.toJson()).should.be.true();
        e1 = u.addEdgeTo(v, {edgeLabel: 'e1B'});
        // replacing an edge should not change out degree
        compareAsSets(u.outgoingEdges, [e1, e3, e4], e => e.toJson()).should.be.true();
      });

      it('# should include edges passed on construction', () => {
        let uLabel = 'source';
        let v = new Vertex(1);
        let w = new Vertex(2);
        let z = new Vertex(3);
        let e1 = new Edge(uLabel, v.label, {edgeLabel: 'e1'});
        let e2 = new Edge(uLabel, v.label, {edgeLabel: 'e2'});
        let e3 = new Edge(uLabel, w.label, {edgeLabel: 'e3'});
        let e4 = new Edge(uLabel, z.label, {edgeLabel: 'e4'});
        let e5 = new Edge(uLabel, uLabel, {edgeLabel: 'e5'});

        let u = new Vertex(uLabel, { outgoingEdges: [e1, e2, e3, e4, e5]});
        // e2 should hide e1
        compareAsSets(u.outgoingEdges, [e2, e3, e4, e5], e => e.toJson()).should.be.true();
      });

      it('# should include edges passed on construction, overwriting same labels', () => {
        let uLabel = 'source';
        let v = new Vertex(1);
        let w = new Vertex(2);
        let z = new Vertex(3);
        let e1 = new Edge(uLabel, v.label, {edgeLabel: 'e1'});
        let e2 = new Edge(uLabel, v.label, {edgeLabel: 'e2'});
        let e3 = new Edge(uLabel, w.label, {edgeLabel: 'e3'});
        let e4 = new Edge(uLabel, z.label, {edgeLabel: 'e4'});
        let e5 = new Edge(uLabel, uLabel, {edgeLabel: 'e5'});
        let e1B = new Edge(uLabel, v.label, {edgeLabel: 'e1'});

        let u = new Vertex(uLabel, { outgoingEdges: [e1, e2, e3, e4, e5, e1B]});
        // e1B should overwrite e1 and hide e2
        compareAsSets(u.outgoingEdges, [e3, e4, e5, e1B], e => e.toJson()).should.be.true();
      });
    });
  });
});

describe('Methods', () => {
  describe('edgeTo()', () => {
    it('should throw if the argument is not a Vertex', () => {
      let v = new Vertex(2);

      const v2 = 'a string';
      expect(() => v.edgeTo(v2)).to.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex.edgeTo', 'v', v2));
    });

    it('# should return undefined if no such edge exists', () => {
      let v = new Vertex(2, {outgoingEdges: [new Edge(2, 2)]});
      expect(v.edgeTo(new Vertex('any'))).to.be.eql(undefined);
    });

    it('# should return the edge if exists', () => {
      let e = new Edge(2, 2);
      let v = new Vertex(2, {outgoingEdges: [e]});
      v.edgeTo(v).should.be.eql(e);
      v.edgeTo(v).equals(e).should.be.true();
    });


    it('# should return the last edge added for the destination', () => {
      let e = new Edge(2, 3);
      let v = new Vertex(2, {outgoingEdges: [e]});
      let u = new Vertex(3);
      let e1 = new Edge(2, 3, {label: 'label'});
      v.addEdge(e1);

      v.edgeTo(u).should.be.eql(e1);
      v.edgeTo(u).equals(e1).should.be.true();
    });
  });

  describe('addEdge()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];

    describe('Simple Graph', () => {
      it('should throw if the argument is not an Edge', () => {
        let v = new Vertex(2);

        labels.forEach(label => {
          expect(() => v.addEdge(label)).to.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex.addEdge', 'edge', label));
        });
      });

      it('# should add new edges and hide old ones', () => {
        let e = new Edge(2, 3, {weight: 2});
        let v = new Vertex(2, {outgoingEdges: [e]});
        let u = new Vertex(3);
        let w = new Vertex('44');
        let e1 = new Edge(2, 3, {label: 'label', weight: -0.5});
        v.addEdge(e1);

        v.edgeTo(u).should.be.eql(e1);
        v.edgeTo(u).equals(e1).should.be.true();

        let e2 = new Edge(2, '44', {label: 'x', weight: -10.5});
        v.addEdge(e2);
        let e3 = new Edge(2, 3, {label: 'x', weight: 5});
        v.addEdge(e3);

        v.edgeTo(u).should.be.eql(e3);
        v.edgeTo(u).equals(e3).should.be.true();

        v.edgeTo(w).should.be.eql(e2);
        v.edgeTo(w).equals(e2).should.be.true();
      });
    });
  });

  describe('addEdgeTo()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];

    describe('Simple Graph', () => {
      it('should throw if the first argument is not a Vertex', () => {
        let v = new Vertex(2);

        labels.forEach(label => {
          expect(() => v.addEdgeTo(label)).to.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex.addEdgeTo', 'v', label));
        });
      });

      it('# should add the edge\'s label', () => {
        let e = new Edge(2, 3, {weight: 2});
        let v = new Vertex(2, {outgoingEdges: [e]});
        let u = new Vertex(3);
        let w = new Vertex('44');
        const eLabel1 = 'lab1';
        v.addEdgeTo(u, {edgeLabel: eLabel1});

        e = v.edgeTo(u);
        e.source.should.be.eql(v.label);
        e.destination.should.be.eql(u.label);
        e.label.should.be.eql(eLabel1);

        const eLabel2 = [1, 2, 3];
        const eLabel3 = x => x * x;

        v.addEdgeTo(w, {edgeLabel: eLabel2});
        v.addEdgeTo(u, {edgeLabel: eLabel3});

        e = v.edgeTo(u);
        e.source.should.be.eql(v.label);
        e.destination.should.be.eql(u.label);
        e.label.should.be.eql(eLabel3);

        e = v.edgeTo(w);
        e.source.should.be.eql(v.label);
        e.destination.should.be.eql(w.label);
        e.label.should.be.eql(eLabel2);
      });

      it('# should add the edge\'s weight', () => {
        let e = new Edge(2, 3, {weight: 2});
        let v = new Vertex(2, {outgoingEdges: [e]});
        let u = new Vertex(3);
        let w = new Vertex('44');
        const eWeight1 = 10.1;
        v.addEdgeTo(u, {edgeWeight: eWeight1});

        e = v.edgeTo(u);
        e.source.should.be.eql(v.label);
        e.destination.should.be.eql(u.label);
        e.weight.should.be.eql(eWeight1);

        const eWeight2 = Math.random();
        const eWeight3 = -123;

        v.addEdgeTo(w, {edgeWeight: eWeight2});
        v.addEdgeTo(u, {edgeWeight: eWeight3});

        e = v.edgeTo(u);
        e.source.should.be.eql(v.label);
        e.destination.should.be.eql(u.label);
        e.weight.should.be.eql(eWeight3);

        e = v.edgeTo(w);
        e.source.should.be.eql(v.label);
        e.destination.should.be.eql(w.label);
        e.weight.should.be.eql(eWeight2);
      });
    });
  });


  describe('removeEdge()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];

    describe('Simple Graph', () => {
      it('should throw if the argument is not an Edge', () => {
        let v = new Vertex(2);

        labels.forEach(label => {
          expect(() => v.removeEdge(label)).to.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex.removeEdge', 'edge', label));
        });
      });

      it('# should remove all edges to dest with the same label', () => {
        let e = new Edge(2, 3, {weight: 2});
        let v = new Vertex(2, {outgoingEdges: [e]});
        let u = new Vertex(3);
        let w = new Vertex('44');

        let e1 = new Edge(2, 3, {label: 'label', weight: -0.5});
        v.addEdge(e1);
        let e2 = new Edge(2, '44', {label: 'x', weight: -10.5});
        v.addEdge(e2);
        let e3 = new Edge(2, 3, {label: 'x', weight: 5});
        v.addEdge(e3);
        let e4 = new Edge(2, 3, {label: 'label', weight: 15});
        v.addEdge(e4);

        v.edgeTo(u).should.be.eql(e4);
        v.edgeTo(u).equals(e4).should.be.true();

        v.edgeTo(w).should.be.eql(e2);
        v.edgeTo(w).equals(e2).should.be.true();

        v.removeEdge(e4);
        v.edgeTo(u).should.be.eql(e3);
        v.edgeTo(u).equals(e3).should.be.true();

        v.removeEdge(e3);
        v.edgeTo(u).should.be.eql(e);
        v.edgeTo(u).equals(e).should.be.true();

        v.removeEdge(e);
        expect(v.edgeTo(u)).to.be.undefined;

        v.removeEdge(e2);
        expect(v.edgeTo(w)).to.be.undefined;
      });
    });
  });

  describe('removeEdgeTo()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];

    describe('Simple Graph', () => {
      it('should throw if the first argument is not a Vertex', () => {
        let v = new Vertex(2);

        labels.forEach(label => {
          expect(() => v.removeEdgeTo(label)).to.throw(ERROR_MSG_INVALID_ARGUMENT('Vertex.removeEdgeTo', 'v', label));
        });
      });

      it('# should remove all edges to dest with the same label', () => {
        let e = new Edge(2, 3, {weight: 2});
        let v = new Vertex(2, {outgoingEdges: [e]});
        let u = new Vertex(3);
        let w = new Vertex('44');

        let e1 = new Edge(2, 3, {label: 'label', weight: -0.5});
        v.addEdge(e1);
        let e2 = new Edge(2, '44', {label: 'x', weight: -10.5});
        v.addEdge(e2);
        let e3 = new Edge(2, 3, {label: 'x', weight: 5});
        v.addEdge(e3);
        let e4 = new Edge(2, 3, {label: 'label', weight: 15});
        v.addEdge(e4);

        v.edgeTo(u).should.be.eql(e4);
        v.edgeTo(u).equals(e4).should.be.true();

        v.edgeTo(w).should.be.eql(e2);
        v.edgeTo(w).equals(e2).should.be.true();

        v.removeEdgeTo(u, {edgeLabel: 'label'});
        v.edgeTo(u).should.be.eql(e3);
        v.edgeTo(u).equals(e3).should.be.true();

        v.removeEdgeTo(u, {edgeLabel: 'x'});
        v.edgeTo(u).should.be.eql(e);
        v.edgeTo(u).equals(e).should.be.true();

        v.removeEdgeTo(u, {edgeLabel: undefined});
        expect(v.edgeTo(u)).to.be.undefined;

        v.removeEdgeTo(w, {edgeLabel: 'any'});
        v.edgeTo(w).should.be.eql(e2);
        v.edgeTo(w).equals(e2).should.be.true();

        v.removeEdgeTo(w, {edgeLabel: 'x'});
        expect(v.edgeTo(w)).to.be.undefined;
      });

      it('# should remove all edges to dest if no label is passed', () => {
        let e = new Edge(2, 3, {weight: 2});
        let v = new Vertex(2, {outgoingEdges: [e]});
        let u = new Vertex(3);
        let w = new Vertex('44');

        let e1 = new Edge(2, 3, {label: 'label', weight: -0.5});
        v.addEdge(e1);
        let e2 = new Edge(2, '44', {label: 'x', weight: -10.5});
        v.addEdge(e2);
        let e3 = new Edge(2, 3, {label: 'x', weight: 5});
        v.addEdge(e3);
        let e4 = new Edge(2, 3, {label: 'label', weight: 15});
        v.addEdge(e4);

        v.edgeTo(u).should.be.eql(e4);
        v.edgeTo(u).equals(e4).should.be.true();

        v.edgeTo(w).should.be.eql(e2);
        v.edgeTo(w).equals(e2).should.be.true();

        v.removeEdgeTo(u, {edgeLabel: null});
        expect(v.edgeTo(u)).to.be.undefined;

        v.removeEdgeTo(w, {edgeLabel: null});
        expect(v.edgeTo(w)).to.be.undefined;
      });
    });
  });

  describe('equals()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return true if two edges are equals in all their fields', () => {
      labels.forEach(label => {
        const size = Math.random()
        let v1 = new Vertex(label, {size: size});
        let v2 = new Vertex(label, {size: size});
        v1.equals(v2).should.be.true();
      });
    });

    it('# should return false if the argument is not a Vertex', () => {
      labels.forEach(label => {
        const dest = choose(labels);
        const size = Math.random();
        let v1 = new Vertex(label, {size: size});
        v1.equals(choose(labels)).should.be.eql(false);
      });
    });

    it('# should return false if label is different', () => {
      labels.forEach(label => {
        const label2 = choose(labels);
        const dest = choose(labels);
        const size = Math.random();
        let v1 = new Vertex(label, {size: size});
        let v2 = new Vertex(label2,  {size: size});
        v1.equals(v2).should.be.eql(consistentStringify(label) === consistentStringify(label2));
      });
    });

    it('# should return false if size is different', () => {
      labels.forEach(label => {
        const size1 = Math.random();
        const size2 = Math.random();
        let v1 = new Vertex(label, {size: size1});
        let v2 = new Vertex(label, {size: size2});
        v1.equals(v2).should.be.eql(consistentStringify(size1) === consistentStringify(size2));
      });
    });

    it('# should return false if edges are different', () => {
      labels.forEach(label => {
        const dest = choose(labels);
        const edgeLabel1 = choose(labels);
        const edgeLabel2 = choose(labels);

        let e1 = new Edge(label, dest, {label: edgeLabel1, weight: Math.random()});
        let e2 = new Edge(label, dest, {label: edgeLabel2, weight: Math.random()});
        const size = Math.random();
        let v1 = new Vertex(label, {size: size, outgoingEdges: [e1, e2]});
        let v2 = new Vertex(label, {size: size, outgoingEdges: []});
        v1.equals(v2).should.be.eql(false);
        v1 = new Vertex(label, {size: size, outgoingEdges: [e1]});
        v2 = new Vertex(label, {size: size, outgoingEdges: [e2]});
        v1.equals(v2).should.be.eql(e1.equals(v2));
      });
    });
  });

  describe('labelEquals()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return true if the edge\'s label is (deeply)equal to the argument' , () => {
      labels.forEach(label => {
        let v = new Vertex(label);
        v.labelEquals(label).should.be.true();
      });
    });

    it('# should return false iff label is different', () => {
      labels.forEach(label => {
        let v = new Vertex(label);
        v.labelEquals(label).should.be.true();
        const label2 = choose(labels);
        v.labelEquals(label2).should.be.eql(consistentStringify(label) === consistentStringify(label2));
      });
    });
  });

  describe('toJson()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# should return a valid json' , () => {
      labels.forEach(label => {
        const dest = choose(labels);
        const edgeLabel = choose(labels);
        const weight = Math.random();
        let e = new Edge(label, dest, {label: edgeLabel, weight: weight});
        let v = new Vertex(label, {size: Math.random(), outgoingEdges: [e]});
        expect(() => JSON.parse(v.toJson())).not.to.throw();
      });
    });

    it('# should stringify the fields consistently and deep-stringify all the fields' , () => {
      let e = new Edge('abc', '1', { label: 'label', weight: -0.1e14});
      let v = new Vertex('abc', {size:3.14, outgoingEdges: [e]});
      v.toJson().should.eql('{"edges":["\\\"{\\\\\\\"destination\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"label\\\\\\\":\\\\\\\"label\\\\\\\",\\\\\\\"source\\\\\\\":\\\\\\\"abc\\\\\\\",\\\\\\\"weight\\\\\\\":-10000000000000}\\\""],"label":"abc","size":3.14}');
    });
  });

  describe('fromJson()', () => {
    const labels = [0, 1, -1, 3.1415, -2133, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -13.12, '1', '-1e14'];
    it('# applyed to the result of toJson, it should match source vertex ' , () => {
      labels.forEach(label => {
        let e1 = new Edge(label, choose(labels), {label: choose(labels), weight: Math.random()});
        let e2 = new Edge(label, choose(labels), {label: choose(labels), weight: Math.random()});
        let e3 = new Edge(label, choose(labels), {label: choose(labels), weight: Math.random()});
        let v = new Vertex(label, {size: Math.random(), outgoingEdges: [e1, e2, e3]});
        Vertex.fromJson(JSON.parse(v.toJson())).should.eql(v);
      });
    });

    it('# should parse the fields consistently and deep-parse all the fields' , () => {
      let e = new Edge('abc', '1', { label: 'label', weight: -0.1e14});
      let v = new Vertex('abc', {size:3.14, outgoingEdges: [e]});
      Vertex.fromJson(JSON.parse(v.toJson())).should.eql(v);
    });
  });

});
