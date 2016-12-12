// Package goes here
import JoinServer from './server';
import JoinClient from './client';

if (typeof Meteor === 'undefined') {
  throw new Error('PublishJoin can only be used in a Meteor project');
}

export {
  JoinServer,
  JoinClient,
};
