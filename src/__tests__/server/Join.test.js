/* global before, after */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import sinon from 'sinon';

import Join from '../../server/Join';

const { describe, it } = global;

describe('Join class', () => {
  before(() => {
    global.Meteor = {
      bindEnvironment(cb) {
        return cb;
      },
    };
  });

  after(() => {
    delete global.Meteor;
  });

  describe('constructor', () => {});

  describe('_initPublishValueForContext', () => {
    it('should call once the added method of context with exact args', () => {
      const join = new Join({
        name: 'testJoin',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      const added = sinon.spy();
      const testContext = { added };
      const testPublishedValue = 10;

      join._initPublishValueForContext(testContext, testPublishedValue);

      expect(added.calledOnce).to.be.true;
      expect(added.args[0][0]).to.equal('PublishJoin');
      expect(added.args[0][1]).to.equal('testJoin');
      expect(added.args[0][2]).to.deep.equal({ value: testPublishedValue });
    });
  });

  describe('_changed', () => {
    it('should call changed method of all contexts and update metadata', () => {
      const changed = sinon.spy();
      const joinName = 'testJoin';
      const publishedValue = 10;
      const join = new Join({
        name: joinName,
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed,
        },
        isShared: false,
      });

      join._changed(publishedValue);

      expect(changed.calledOnce).to.be.true;
      expect(changed.args[0][0]).to.equal('PublishJoin');
      expect(changed.args[0][1]).to.equal(joinName);
      expect(changed.args[0][2]).to.deep.equal({ value: publishedValue });
    });
  });

  describe('_getLastRunDoJoinTime', () => {
    it('should return the lastRunDoJoin timestamp', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      const now = new Date();
      join.lastRunDoJoin = now;

      expect(join._getLastRunDoJoinTime()).to.equal(now.getTime());
    });
  });

  describe('_getLastPublishedTime', () => {
    it('should return the lastPublished timestamp', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      const now = new Date();
      join.lastPublished = now;

      expect(join._getLastPublishedTime()).to.equal(now.getTime());
    });
  });

  describe('_isPublishingButExceedMaxWaitingTime', () => {
    it('should be true if is publishing and exceed max waiting time', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });
      const nowTimestamp = new Date().getTime();
      const threeSecondAgo = new Date(nowTimestamp - 3000);

      join.isPublishing = true;
      join.lastRunDoJoin = threeSecondAgo;

      expect(join._isPublishingButExceedMaxWaitingTime()).to.be.true;
    });

    it('should be false if is not publishing', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      const nowTimestamp = new Date().getTime();
      const threeSecondAgo = new Date(nowTimestamp - 3000);

      join.isPublishing = false;
      join.lastRunDoJoin = threeSecondAgo;

      expect(join._isPublishingButExceedMaxWaitingTime()).to.be.false;
    });

    it('should be false if is publishing and not excced max waiting time', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      join.isPublishing = true;
      join.lastRunDoJoin = new Date();

      expect(join._isPublishingButExceedMaxWaitingTime()).to.be.false;
    });
  });

  describe('_isNotPublishingAndExceedIntervalTime', () => {
    it('should be false if publishing', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      join.isPublishing = true;
      join.lastPublished = new Date();

      expect(join._isNotPublishingAndExceedIntervalTime()).to.be.false;
    });

    it('should be false if not exceed interval time', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      join.isPublishing = false;
      join.lastPublished = new Date();

      expect(join._isNotPublishingAndExceedIntervalTime()).to.be.false;
    });

    it('should be true if not publishing and exceed interval time', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      join.isPublishing = false;
      join.lastPublished = new Date(new Date().getTime() - 2000);

      expect(join._isNotPublishingAndExceedIntervalTime()).to.be.true;
    });
  });

  describe('removeContext', () => {
    it('should remove context if _subscriptionId matches', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });
      const context1 = { _subscriptionId: 'sub1' };
      const context2 = { _subscriptionId: 'sub2' };
      const context3 = { _subscriptionId: 'sub3' };
      const testContexts = [context1, context2, context3];

      join.contexts = [...testContexts];

      join.removeContext(context1);

      expect(join.contexts).to.have.lengthOf(2);
      expect(join.contexts).to.have.deep.property('[0]')
        .that.deep.equals(context2);
      expect(join.contexts).to.have.deep.property('[1]')
        .that.deep.equals(context3);
    });

    it('should not remove context if _subscriptionId does not match', () => {
      const join = new Join({
        name: 'joinName',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });
      const context1 = { _subscriptionId: 'sub1' };
      const context2 = { _subscriptionId: 'sub2' };
      const context3 = { _subscriptionId: 'sub3' };
      const context4 = { _subscriptionId: 'sub4' };
      const testContexts = [context1, context2, context3];

      join.contexts = [...testContexts];

      join.removeContext(context4);

      expect(join.contexts).to.have.lengthOf(3);
      expect(join.contexts).to.have.deep.property('[0]')
        .that.deep.equals(context1);
      expect(join.contexts).to.have.deep.property('[1]')
        .that.deep.equals(context2);
      expect(join.contexts).to.have.deep.property('[2]')
        .that.deep.equals(context3);
    });
  });

  describe('addContext', () => {
    it('should init publish value for context and add context to contexts array', () => {
      const join = new Join({
        name: 'testJoin',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      const added = sinon.spy();
      const testContext = { added };
      const testPublishedValue = 10;

      join.currentPublishedValue = testPublishedValue;

      join.addContext(testContext);

      expect(added.calledOnce).to.be.true;
      expect(added.args[0][0]).to.equal('PublishJoin');
      expect(added.args[0][1]).to.equal('testJoin');
      expect(added.args[0][2]).to.deep.equal({ value: testPublishedValue });

      expect(join.contexts).to.have.lengthOf(2);
      expect(join.contexts).to.have.deep.property('[1]')
        .that.deep.equals(testContext);
    });
  });

  describe('isContextsEmpty', () => {
    it('should return true if contexts is empty', () => {
      const join = new Join({
        name: 'testJoin',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      join.contexts = [];

      expect(join.isContextsEmpty()).to.be.true;
    });

    it('should return false if contexts is not empty', () => {
      const join = new Join({
        name: 'testJoin',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      expect(join.isContextsEmpty()).to.be.false;
    });
  });

  describe('needPublish', () => {
    it('should be true if _isPublishingButExceedMaxWaitingTime true', () => {
      const join = new Join({
        name: 'testJoin',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      join._isPublishingButExceedMaxWaitingTime = () => true;

      expect(join.needPublish()).to.be.true;
    });
    it('should be true if _isNotPublishingAndExceedIntervalTime true', () => {
      const join = new Join({
        name: 'testJoin',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      join._isNotPublishingAndExceedIntervalTime = () => true;

      expect(join.needPublish()).to.be.true;
    });
    it(`should be false if _isPublishingButExceedMaxWaitingTime and
      _isNotPublishingAndExceedIntervalTime false`, () => {
      const join = new Join({
        name: 'testJoin',
        interval: 1000,
        maxWaiting: 1000,
        doJoin() {},
        context: {
          added() {},
          changed() {},
        },
        isShared: false,
      });

      join._isNotPublishingAndExceedIntervalTime = () => false;
      join._isPublishingButExceedMaxWaitingTime = () => false;

      expect(join.needPublish()).to.be.false;
    });
  });

  describe('publish', () => {

    // expect(join.isPublishing).to.be.false;
    // expect(join.currentPublishedValue).to.equal(publishedValue);
    // expect(join.lastPublished.getTime()).to.be.closeTo(new Date().getTime(), 200);
  });
});
