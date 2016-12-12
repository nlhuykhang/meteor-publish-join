import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { JoinClient } from 'meteor-publish-join';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
  this.subscribe('test');
});

Template.hello.helpers({
  randomNumber() {
    return JoinClient.get('randomNumber');
  },
  numComments() {
    return JoinClient.get('numComments');
  },
  numLikesOfAPost() {
    const postId = 'post1';
    return JoinClient.get(`numLikesOfAPost${postId}`);
  },
  promise() {
    return JoinClient.get('promise');
  },
});
