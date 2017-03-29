/* global Meteor, Mongo, Package */

const client = new Mongo.Collection('PublishJoin');

client.get = function get(name) {
  const join = this.findOne({
    _id: name,
  });

  return join && join.value;
};

client.has = function get(name) {
  return !!this.findOne({
    _id: name,
  });
};

if (Package.templating) {
  Package.templating.Template.registerHelper('getPublishedJoin', name => client.get(name));
  Package.templating.Template.registerHelper('hasPublishedJoin', name => client.has(name));
}

export default client;
