/* global Meteor */

export default class Store {
  constructor() {
    this.joinArr = [];
    this.workerHandler = null;
  }

  _findJoinIndex(join) {
    return this.joinArr.findIndex(j => j._id === join._id);
  }

  _removeJoinAtIndex(index) {
    if (index > -1) {
      this.joinArr.splice(index, 1);
    }
  }

  addJoin(join) {
    this.push(join);
  }

  removeJoin(join) {
    const joinIndex = this._findJoinIndex(join);

    this._removeJoinAtIndex(joinIndex);
  }

  setWorkerHandler(handler) {
    this.workerHandler = handler;
  }

  getWorkerHandler() {
    return this.workerHandler;
  }
}
