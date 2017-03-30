/* global Meteor, Mongo, Package */

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

  client.has = function get(name) {
    return !!collection.findOne({
      _id: name,
    });
  };

  if (Package.templating) {
    Package.templating.Template.registerHelper('getPublishedJoin', name => client.get(name));
    Package.templating.Template.registerHelper('hasPublishedJoin', name => client.has(name));
  }
}

export const Client = client;
export const Collection = collection;
