/* global Meteor */

import uuid from 'uuid';

export default class Join {
  constructor(data) {
    const self = this;

    const {
      name,
      interval,
      maxWaiting,
      doJoin,
      context,
      isShared,
      log,
    } = data;

    // NOTE: _id is used to find and clear the instance when the publication is stopped
    self._id = uuid.v1();

    self.name = name;
    self.interval = interval;
    self.doJoin = Meteor.bindEnvironment(doJoin);
    self.contexts = [context];
    self.lastPublished = new Date(0);
    self.lastRunDoJoin = new Date(0);
    self.isPublishing = false;
    self.maxWaiting = maxWaiting || 5000;
    self.currentPublishedValue = undefined;
    self.isShared = !!isShared;
    self.log = log;

    self._initPublishValueForContext(context, self.currentPublishedValue);
  }

  _initPublishValueForContext(context, value) {
    context.added('PublishJoin', this.name, { value });
  }

  _changed(value) {
    const self = this;

    self.contexts.forEach(context => context.changed('PublishJoin', self.name, {
      value,
    }));
  }

  _getLastRunDoJoinTime() {
    return this.lastRunDoJoin.getTime();
  }

  _getLastPublishedTime() {
    return this.lastPublished.getTime();
  }

  _isPublishingButExceedMaxWaitingTime() {
    const now = new Date().getTime();

    return this.isPublishing &&
      (now - this._getLastRunDoJoinTime() >= this.maxWaiting);
  }

  _isNotPublishingAndExceedIntervalTime() {
    const now = new Date().getTime();

    return !this.isPublishing &&
      (now - this._getLastPublishedTime() >= this.interval);
  }

  removeContext({ _subscriptionId }) {
    this.contexts = this.contexts.filter(
      context => context._subscriptionId !== _subscriptionId,
    );
  }

  addContext(context) {
    this._initPublishValueForContext(context, this.currentPublishedValue);
    this.contexts.push(context);
  }

  isContextsEmpty() {
    return this.contexts.length === 0;
  }

  needPublish() {
    return this._isPublishingButExceedMaxWaitingTime() ||
     this._isNotPublishingAndExceedIntervalTime();
  }

  publish() {
    const self = this;

    try {
      self.isPublishing = true;
      self.lastRunDoJoin = new Date();
      const value = self.doJoin();

      if (value instanceof Promise) {
        value.then((data) => {
          self._changed(data);
        });
      } else {
        self._changed(value);
      }

      self.lastPublished = new Date();
      self.isPublishing = false;
      self.currentPublishedValue = value;
    } catch (e) {
      self.log((e && (e.stack || e.message)) || e, 3);
    }
  }
}
