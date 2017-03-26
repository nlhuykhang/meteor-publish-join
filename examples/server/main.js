import { Meteor } from 'meteor/meteor';
import { JoinServer } from 'meteor-publish-join';
import fetch from 'node-fetch';

const Post = new Mongo.Collection('post');
const Comment = new Mongo.Collection('comment');

Meteor.startup(() => {
  Post.remove({});
  Comment.remove({});

  Post.rawCollection().insertMany([
    {
      _id: 'post1',
      content: 'post1 content',
      likes: 1,
    }, {
      _id: 'post2',
      content: 'post2 content',
      likes: 2,
    }
  ]);

  Comment.rawCollection().insertMany([
    {
      _id: 'comment1',
      content: 'comment1 content',
      postId: 'post1',
      likes: 10,
    }, {
      _id: 'comment2',
      content: 'comment2 content',
      likes: 11,
      postId: 'post1',
    }, {
      _id: 'comment3',
      content: 'comment3 content',
      likes: 21,
      postId: 'post2',
    }
  ]);

});

Meteor.publish('test', function() {
  this.ready();

  const postId = 'post1';

  JoinServer.publish({
    context: this,
    name: 'randomNumber',
    interval: 1000,
    maxWaiting: 1000,
    doJoin() {
      return Math.random();
    },
    isShared: true,
  });

  JoinServer.publish({
    context: this,
    name: 'numComments',
    interval: 1000,
    doJoin() {
      return Comment.find().count();
    },
  });

  JoinServer.publish({
    context: this,
    name: `numLikesOfAPost${postId}`,
    interval: 1000,
    doJoin() {
      // get all likes on post and comments of post
      const value = Post.aggregate([
        {
          $match: {
            _id: postId,
          }
        }, {
          $lookup: {
            from: 'comment',
            localField: '_id',
            foreignField: 'postId',
            as: 'comments',
          }
        }, {
          $unwind: '$comments',
        }, {
          $group: {
            _id: '$_id',
            postLikes: {
              $first: '$likes',
            },
            commentLikes: {
              $sum: '$comments.likes',
            }
          },
        }, {
          $project: {
            totalLikes: {
              $add: ['$postLikes', '$commentLikes'],
            }
          },
        }
      ]);

      return value[0] && value[0].totalLikes;
    },
  });

  JoinServer.publish({
    context: this,
    name: 'promise',
    interval: 1000,
    doJoin() {
      const id = parseInt(Math.random() * 100, 10);

      return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
        .then(res => res.json())
        .then(data => data.title)
        .catch(err => console.error(err));
    },
    isShared: true,
  });
});
