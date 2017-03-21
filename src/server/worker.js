/* global Meteor */

function publishAllJoin(store) {
  store.joinArr.forEach((join) => {
    if (join && join.needPublish()) {
      Meteor.defer(() => join.publish());
    }
  });
}

function scheduleNextRun(store, time) {
  // eslint-disable-next-line no-use-before-define
  return Meteor.setTimeout(() => startPublishWorker(store), time);
}

export function startPublishWorker(store) {
  if (typeof Meteor !== 'undefined') {
    store.setWorkerHandler(null);

    publishAllJoin(store);

     // what should be the timeout number? is 500 a good number
    const handler = scheduleNextRun(store, 500);

    store.setWorkerHandler(handler);
  }
}

export function stopPublishWorker(store) {
  if (typeof Meteor !== 'undefined') {
    const handler = store.getWorkerHandler();

    if (handler) {
      Meteor.clearTimeout(handler);
      return;
    }

    // XXX Could there be any issues causing this run forever?
    Meteor.setTimeout(() => stopPublishWorker(store), 200);
  }
}
