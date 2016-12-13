/* global Meteor */

import uuid from 'node-uuid';

export default class Join {
  constructor(data, store, worker) {
    const self = this;
    const needStartWorker = store.joinArr.length === 0;

    const {
      name,
      interval,
      doJoin,
      context,
    } = data;

    // NOTE: _id is used to find and clear the instance when the publication is stopped
    self._id = uuid.v1();

    self.name = name;
    self.interval = interval;
    self.doJoin = Meteor.bindEnvironment(doJoin);
    self.context = context;
    self.lastPublish = new Date();
    self.isPublishing = false;

    store.joinArr.push(self);

    self.context.added('PublishJoin', self.name, {
      value: undefined,
    });

    if (needStartWorker) {
      worker.startPublishWorker(store);
    }

    // remove this instance from cache array when the publication is stopped
    self.context.onStop(() => {
      // get the index
      const index = store.joinArr.findIndex(obj => obj._id === self._id);

      // remove the instance
      if (index > -1) {
        store.joinArr.splice(index, 1);
      }

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

    self.lastPublish = new Date();
    self.isPublishing = false;
  }

  publish() {
    const self = this;

    try {
      self.isPublishing = true;
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

  needPublish() {
    const self = this;

    const now = new Date().getTime();

    return (now - self.lastPublish.getTime()) >= self.interval && self.isPublishing === false;
  }
}
