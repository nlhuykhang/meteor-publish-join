/* global Meteor */

import uuid from 'node-uuid';

export default class Join {
  constructor(data, store, worker) {
    const self = this;
    const needStartWorker = store.joinArr.length === 0;

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

    store.addJoin(self);

    self.context.added('PublishJoin', self.name, {
      value: undefined,
    });

    if (needStartWorker) {
      worker.startPublishWorker(store);
    }

    // remove this instance from cache array when the publication is stopped
    self.context.onStop(() => {
      store.removeJoin(self);

      if (store.joinArr.length === 0) {
        worker.stopPublishWorker(store);
      }
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

  getLastRunDoJoinTime() {
    return this.lastRunDoJoin.getTime();
  }

  getLastPublishedTime() {
    return this.lastPublished.getTime();
  }

  isPublishingButExceedMaxWaitingTime() {
    const now = new Date().getTime();

    return this.isPublishing &&
      (now - this.getLastRunDoJoinTime() >= this.maxWaiting);
  }

  isNotPublishingAndExceedIntervalTime() {
    const now = new Date().getTime();

    return !this.isPublishing &&
      (now - this.getLastPublishedTime() >= this.interval);
  }

  needPublish() {
    return this.isPublishingButExceedMaxWaitingTime() ||
     this.isNotPublishingAndExceedIntervalTime();
  }
}
