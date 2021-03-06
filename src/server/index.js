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
    join.log(`Removing the subscription ${context._subscriptionId} on connection ${context.connection && context.connection.id} by user ${context.userId} from join ${join._id}`, 6);
    join.removeContext(context);

    if (join.isContextsEmpty()) {
      join.log(`Cleaning up empty join ${join._id}`, 7);
      store.removeJoin(join);

      if (store.isJoinArrayEmpty()) {
        join.log('Stopping the publish worker', 5);
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

  if (!data.log) {
    data.log = server.log;
  }

  const join = new Join(data);

  join.log(`Initializing join ${data.name} - ${join._id} for subscription ${data.context._subscriptionId} on connection ${data.context.connection && data.context.connection.id} by user ${data.context.userId}`, 6);
  store.addJoin(join);

  if (needStartWorker) {
    join.log('Starting the publish worker', 5);
    startPublishWorker(store);
  }

  return join;
}

function setUpSharedJoin(store, data) {
  let join = store.findSharedJoinByName(data.name);

  if (join) {
    join.log(`Linking the existing join ${join._id} to the subscription ${data.context._subscriptionId} on connection ${data.context.connection && data.context.connection.id} by user ${data.context.userId}`, 6);
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
    join.log(`The connection ${data.context.connection && data.context.connection.id} on address ${data.context.connection && data.context.connection.clientAddress} is using the user-agent ${data.context.connection && data.context.connection.httpHeaders['user-agent']}`, 7);

    setUpOnStopHandlerForContext({
      context: data.context,
      join,
      store,
    });
  };
}

export default server;
