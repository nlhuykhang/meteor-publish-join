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
  isBoolean,
  throwError,
} from '../helpers';

const server = {
  log(msg, level) {
    if (level < 4) {
      console.error(msg);
    }
  },
};

function validate(data) {
  const {
    context,
    name,
    interval,
    doJoin,
    maxWaiting,
    isShared,
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

  if (!isBoolean(isShared) && !isUndefined(isShared)) {
    throwError('PublishJoin: isShared must be a boolean if provided');
  }
}

function setUpOnStopHandlerForContext({
  context,
  join,
  store,
}) {
  context.onStop(() => {
    join.log('Removing context from join', 6);
    join.removeContext(context);

    if (join.isContextsEmpty()) {
      join.log('Removing empty context', 7);
      store.removeJoin(join);

      if (store.isJoinArrayEmpty()) {
        join.log('Stopping the publish worker', 7);
        stopPublishWorker(store, join.log);
      }
    }
  });
}

function isShareJoin({ isShared }) {
  return !!isShared;
}

function setUpNormalJoin(store, data) {
  const needStartWorker = store.isJoinArrayEmpty();

  if (!data.logging) {
    data.logging = server.logging;
  }

  const join = new Join(data);

  store.addJoin(join);

  join.log(`Publishing a join on ${data.name}`, 6);
  if (needStartWorker) {
    join.log('Starting the publish worker');
    startPublishWorker(store);
  }

  return join;
}

function setUpSharedJoin(store, data) {
  let join = store.findSharedJoinByName(data.name);

  if (join) {
    join.log(`Joining a shared join on ${data.name}`, 6);
    join.addContext(data.context);
  } else {
    join = setUpNormalJoin(store, data);
  }

  return join;
}

if (typeof Meteor !== 'undefined' && Meteor.isServer) {
  const store = new Store();

  server.publish = function publish(data) {
    validate(data);

    let join;

    if (isShareJoin(data)) {
      join = setUpSharedJoin(store, data);
    } else {
      join = setUpNormalJoin(store, data);
    }

    setUpOnStopHandlerForContext({
      context: data.context,
      join,
      store,
    });
  };
}

export default server;
