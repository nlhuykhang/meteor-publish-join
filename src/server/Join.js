/* global Meteor */

import uuid from 'node-uuid';

export default class Join {
  constructor(data) {
    const self = this;

    const {
      name,
      interval,
      maxWaiting,
      doJoin,
      context,
    } = data;

    // NOTE: _id is used to find and clear the instance when the publication is stopped
    self._id = uuid.v1();

    self.name = name;
    self.interval = interval;
    self.doJoin = Meteor.bindEnvironment(doJoin);
    self.context = context;
    self.lastPublished = new Date();
    self.lastRunDoJoin = new Date();
    self.isPublishing = false;
    self.maxWaiting = maxWaiting || 5000;

    self.context.added('PublishJoin', self.name, {
      value: undefined,
    });
  }

  _changed(value) {
    const self = this;

    self.context.changed('PublishJoin', self.name, {
      value,
    });

    self.lastPublished = new Date();
    self.isPublishing = false;
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
    } catch (e) {
      console.error(e);
    }
  }
}
