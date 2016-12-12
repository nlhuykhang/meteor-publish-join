/* global Meteor */

export function startPublishWorker(store) {
  store.workerHandler = null;

  store.joinArr.forEach((join) => {
    if (join && join.needPublish()) {
      Meteor.defer(() => join.publish());
    }
  });

   // what should be the timeout number? is 500 a good number
  store.workerHandler = Meteor.setTimeout(() => startPublishWorker(store), 500);
}

export function stopPublishWorker(store) {
  if (store.workerHandler) {
    Meteor.clearTimeout(store.workerHandler);
    return;
  }

  // XXX Could there be any issues causing this run forever?
  Meteor.setTimeout(() => stopPublishWorker(store), 200);
}
