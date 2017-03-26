/* global Meteor, Mongo */

import Join from './Join';
import Store from './Store';
import { startPublishWorker, stopPublishWorker } from './worker';
import {
  isObject,
  isString,
  isNumber,
  isFunction,
  isUndefined,
  throwError,
} from '../helpers';

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
  if (!isObject(context)) {
    throwError('PublishJoin: context must be an instance of subscription, e.g. this inside publication');
  }

  if (!isString(name)) {
    throwError('PublishJoin: name of a join must be a string');
  }

  // XXX: should there be any limits of interval?
  if (!isNumber(interval)) {
    throwError('PublishJoin: interval must be a number');
  }

  if (!isFunction(doJoin)) {
    throwError('PublishJoin: doJoin must be a function');
  }

  if (!isNumber(maxWaiting) && !isUndefined(maxWaiting)) {
    throwError('PublishJoin: maxWaiting must be a number if provided');
  }
}

function setUpOnStopHandlerForJoin(join, store) {
  join.context.onStop(() => {
    store.removeJoin(join);

    if (store.isJoinArrayEmpty()) {
      stopPublishWorker(store);
    }
  });
}

if (typeof Meteor !== 'undefined' && Meteor.isServer) {
  const store = new Store();

  server.publish = function publish(data) {
    validate(data);

    const needStartWorker = store.isJoinArrayEmpty();

    const join = new Join(data);

    store.addJoin(join);

    if (needStartWorker) {
      startPublishWorker(store);
    }

    setUpOnStopHandlerForJoin(join, store);
  };
}

export default server;
