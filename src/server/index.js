/* global Meteor, Mongo */

import Join from './Join';
import Store from './Store';
import { startPublishWorker, stopPublishWorker } from './worker';

const server = {};

function validate(data) {
  const {
    context,
    name,
    interval,
    doJoin,
    maxWaiting,
  } = data;

  // XXX: need to make sure context is an instance of Meteor subscription
  if (typeof context !== 'object') {
    throw new Error('PublishJoin: context must be an instance of subscription, e.g. this inside publication');
  }

  if (typeof name !== 'string') {
    throw new Error('PublishJoin: name of a join must be a string');
  }

  // XXX: should there be any limits of interval?
  if (typeof interval !== 'number') {
    throw new Error('PublishJoin: interval must be a number');
  }

  if (typeof doJoin !== 'function') {
    throw new Error('PublishJoin: doJoin must be a function');
  }

  if (typeof maxWaiting !== 'number' && typeof maxWaiting !== 'undefined') {
    throw new Error('PublishJoin: maxWaiting must be a number if provided');
  }
}

if (typeof Meteor !== 'undefined' && Meteor.isServer) {
  const store = new Store();

  server.publish = function publish(data) {
    validate(data);

    const join = new Join(data, store, {
      startPublishWorker,
      stopPublishWorker,
    });
  };
}

export default server;
