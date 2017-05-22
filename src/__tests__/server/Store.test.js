/* global before, after */

import { expect } from 'chai';
import sinon from 'sinon';

import Store from '../../server/Store';

const { describe, it } = global;

describe('Store class', () => {
  before(() => {
    global.Meteor = {
      defer(cb) {
        cb();
      },
    };
  });

  describe('constructor', () => {
    it('should create an empty join array and null workerHandler', () => {
      const store = new Store();

      expect(store).to.have.property('joinArr').that.deep.equals([]);
      expect(store).to.have.property('workerHandler', null);
    });
  });

  describe('addJoin', () => {
    it('should add a join object to join array', () => {
      const store = new Store();
      const testJoin = {};

      store.addJoin(testJoin);

      expect(store).to.have.deep.property('joinArr[0]', testJoin);
    });
  });

  describe('_findJoinIndex', () => {
    it('should return the exact index of a join', () => {
      const store = new Store();

      const join1 = { _id: '0' };
      const join2 = { _id: '1' };
      const join3 = { _id: '2' };
      const joinArr = [join1, join2, join3];

      store.joinArr = joinArr;

      expect(store._findJoinIndex(join1)).to.equal(0);
      expect(store._findJoinIndex(join2)).to.equal(1);
      expect(store._findJoinIndex(join3)).to.equal(2);
    });

    it('should return -1 if join does not exist', () => {
      const store = new Store();

      expect(store._findJoinIndex({})).to.equal(-1);
    });
  });

  describe('_removeJoinAtIndex', () => {
    it('should remove join at index', () => {
      const store = new Store();

      const join1 = { _id: '0' };
      const join2 = { _id: '1' };
      const join3 = { _id: '2' };
      const joinArr = [join1, join2, join3];

      store.joinArr = joinArr;

      store._removeJoinAtIndex(0);

      expect(store.joinArr).to.have.lengthOf(2);
      expect(store.joinArr).to.have.deep.property('[0]')
        .that.deep.equals(join2);
      expect(store.joinArr).to.have.deep.property('[1]')
        .that.deep.equals(join3);
    });

    it('should not remove anything if index is greater than arr length', () => {
      const store = new Store();

      const join1 = { _id: '0' };
      const join2 = { _id: '1' };
      const join3 = { _id: '2' };
      const joinArr = [join1, join2, join3];

      store.joinArr = joinArr;

      store._removeJoinAtIndex(10);

      expect(store.joinArr).to.have.lengthOf(3);
      expect(store.joinArr).to.have.deep.property('[0]')
        .that.deep.equals(join1);
      expect(store.joinArr).to.have.deep.property('[1]')
        .that.deep.equals(join2);
      expect(store.joinArr).to.have.deep.property('[2]')
        .that.deep.equals(join3);
    });
  });

  describe('findSharedJoinByName', () => {
    it('should return the exact shared join with name', () => {
      const store = new Store();

      const join1 = { _id: '0', name: 'join1', isShared: true };
      const join2 = { _id: '1', name: 'join2', isShared: false };
      const join3 = { _id: '2', name: 'join3', isShared: false };
      const joinArr = [join1, join2, join3];

      store.joinArr = joinArr;

      expect(store.findSharedJoinByName('join1')).to.equal(join1);
    });

    it('should return undefined if there is no joins having given name', () => {
      const store = new Store();

      const join1 = { _id: '0', name: 'join1', isShared: true };
      const join2 = { _id: '1', name: 'join2', isShared: false };
      const join3 = { _id: '2', name: 'join3', isShared: false };
      const joinArr = [join1, join2, join3];

      store.joinArr = joinArr;

      // eslint-disable-next-line no-unused-expressions
      expect(store.findSharedJoinByName('join4')).to.be.undefined;
    });

    it('should return undefined if the join is not shared', () => {
      const store = new Store();

      const join1 = { _id: '0', name: 'join1', isShared: false };
      const join2 = { _id: '1', name: 'join2', isShared: false };
      const join3 = { _id: '2', name: 'join3', isShared: false };
      const joinArr = [join1, join2, join3];

      store.joinArr = joinArr;

      // eslint-disable-next-line no-unused-expressions
      expect(store.findSharedJoinByName('join1')).to.be.undefined;
    });
  });

  describe('isJoinArrayEmpty', () => {
    it('should return true if join array is empty', () => {
      const store = new Store();

      store.joinArr = [];

      // eslint-disable-next-line no-unused-expressions
      expect(store.isJoinArrayEmpty()).to.be.true;
    });

    it('should return false if join array is not empty', () => {
      const store = new Store();

      const join1 = { _id: '0', name: 'join1', isShared: false };
      const join2 = { _id: '1', name: 'join2', isShared: false };
      const join3 = { _id: '2', name: 'join3', isShared: false };
      const joinArr = [join1, join2, join3];

      store.joinArr = joinArr;

      // eslint-disable-next-line no-unused-expressions
      expect(store.isJoinArrayEmpty()).to.be.false;
    });
  });

  describe('removeJoin', () => {
    it('should remove join in array', () => {
      const store = new Store();

      const join1 = { _id: '0', name: 'join1', isShared: false };
      const join2 = { _id: '1', name: 'join2', isShared: false };
      const join3 = { _id: '2', name: 'join3', isShared: false };
      const joinArr = [join1, join2, join3];

      store.joinArr = joinArr;

      store.removeJoin(join1);

      expect(store.joinArr).to.have.lengthOf(2);
      expect(store.joinArr).to.have.deep.property('[0]')
        .that.deep.equals(join2);
      expect(store.joinArr).to.have.deep.property('[1]')
        .that.deep.equals(join3);
    });

    it('should not remove join not in array', () => {
      const store = new Store();

      const join1 = { _id: '0', name: 'join1', isShared: false };
      const join2 = { _id: '1', name: 'join2', isShared: false };
      const join3 = { _id: '2', name: 'join3', isShared: false };
      const join4 = { _id: '3', name: 'join4', isShared: false };
      const joinArr = [join1, join2, join3];

      store.joinArr = joinArr;

      store.removeJoin(join4);

      expect(store.joinArr).to.have.lengthOf(3);
      expect(store.joinArr).to.have.deep.property('[0]')
        .that.deep.equals(join1);
      expect(store.joinArr).to.have.deep.property('[1]')
        .that.deep.equals(join2);
      expect(store.joinArr).to.have.deep.property('[2]')
        .that.deep.equals(join3);
    });
  });

  describe('setWorkerHandler', () => {
    it('should set worker handler correctly', () => {
      const store = new Store();
      const handler = {};

      store.setWorkerHandler(handler);
      expect(store.workerHandler).to.equal(handler);

      store.setWorkerHandler(null);
      // eslint-disable-next-line no-unused-expressions
      expect(store.workerHandler).to.be.null;
    });
  });

  describe('getWorkerHandler', () => {
    it('should get worker handler correctly', () => {
      const store = new Store();
      const handler = {};

      store.workerHandler = null;
      // eslint-disable-next-line no-unused-expressions
      expect(store.getWorkerHandler()).to.be.null;

      store.workerHandler = 1;
      expect(store.getWorkerHandler()).to.equal(1);

      store.workerHandler = handler;
      expect(store.getWorkerHandler()).to.equal(handler);
    });
  });

  describe('publishAllJoin', () => {
    it('should publish all joins needed to be published', () => {
      const store = new Store();
      const join1 = {
        needPublish: sinon.stub().callsFake(() => true),
        publish: sinon.stub(),
      };
      const join2 = {
        needPublish: sinon.stub().callsFake(() => false),
        publish: sinon.stub(),
      };
      const join3 = {
        needPublish: sinon.stub().callsFake(() => true),
        publish: sinon.stub(),
      };

      const joinArr = [join1, join2, join3];
      store.joinArr = joinArr;

      store.publishAllJoin();

      /* eslint-disable no-unused-expressions */
      expect(join1.needPublish.called).to.be.true;
      expect(join1.publish.called).to.be.true;

      expect(join2.needPublish.called).to.be.true;
      expect(join2.publish.called).to.be.false;

      expect(join3.needPublish.called).to.be.true;
      expect(join3.publish.called).to.be.true;
      /* eslint-enable no-unused-expressions */
    });
  });

  after(() => {
    delete global.Meteor;
  });
});
