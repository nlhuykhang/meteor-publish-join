/* global Meteor, Mongo */

const client = {};

if (typeof Meteor !== 'undefined' && Meteor.isClient) {
  const JoinCollection = new Mongo.Collection('PublishJoin');

  client.get = function get(name) {
    const join = JoinCollection.findOne({
      _id: name,
    });

    return join && join.value;
  };
}

export default client;
