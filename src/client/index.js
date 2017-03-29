/* global Meteor, Mongo, Package */

let collection = {};

if (typeof Meteor !== 'undefined' && Meteor.isClient) {
  collection = new Mongo.Collection('PublishJoin');

  collection.get = function get(name) {
    const join = this.findOne({
      _id: name,
    });

    return join && join.value;
  };

  collection.has = function get(name) {
    return !!this.findOne({
      _id: name,
    });
  };

  if (Package.templating) {
    Package.templating.Template.registerHelper('getPublishedJoin', name => collection.get(name));
    Package.templating.Template.registerHelper('hasPublishedJoin', name => collection.has(name));
  }
}

const client = collection;

export default client;
