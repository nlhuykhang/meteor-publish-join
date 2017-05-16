/* global Meteor, Mongo */

const client = {};
let collection;

if (typeof Meteor !== 'undefined' && Meteor.isClient) {
  collection = new Mongo.Collection('PublishJoin');

  client.get = function get(name) {
    const join = collection.findOne({
      _id: name,
    });

    return join && join.value;
  };

  client.has = function has(name) {
    return !!collection.findOne({
      _id: name,
    });
  };
}

export const Client = client;
export const Collection = collection;
