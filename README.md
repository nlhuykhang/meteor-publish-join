# Meteor Publish Join

[![Build Status](https://travis-ci.org/nlhuykhang/meteor-publish-join.svg?branch=master)](https://travis-ci.org/nlhuykhang/meteor-publish-join) [![Coverage Status](https://coveralls.io/repos/github/nlhuykhang/meteor-publish-join/badge.svg?branch=master)](https://coveralls.io/github/nlhuykhang/meteor-publish-join?branch=master)

Publish non-reactive or aggregated values

## Use Cases

This package will come in handy when you need to publish a non-reactive value or a could-be-reactive value but too expensive to obtain by normal pub/sub, like count of all document, sum of a field of all documents...

All these values could be obtained by ordinary Meteor pub/sub or with the help of other community packages. However the problem is that they do not work smoothly with a large dataset (few thousands), because, for all packages I've known, they rely on Meteor `.observe` and `.observeChange` to track for changes.

These methods are good for small dataset (few hundreds to thousand) and the result need to be published instantly. **When the dataset is big and the result do not need to be published instantly but rather be updated after a certain amount of time**, this package will do better.

Possible use cases:

- Count of all documents and the number of documents is really big (more than a thousand)
- Publish a value can only be obtained by Mongo Aggregation
- Publish a value obtained by calling to a remote server (REST API for ex)

## Install

```bash
npm install --save meteor-publish-join
```

## Usage

##### Sever

```javascript
import { JoinServer } from 'meteor-publish-join';

Meteor.publish('test', function(postId) {

  // Publish the number of all comments, re-run every second
  JoinServer.publish({
    context: this,
    name: 'numComments',
    interval: 1000,
    doJoin() {
      return Comment.find().count();
    },
  });

  // Publish the number of likes on a post, re-run every 5 seconds
  JoinServer.publish({
    context: this,
    name: `numLikesOfAPost${postId}`,
    interval: 1000,
    doJoin() {
      // get all likes on post and comments of post
      const value = Post.aggregate([
        // ...
      ]);

      return value[0] && value[0].totalLikes;
    },
  });

  // Publish a random value from an external API, plays well with promise, re-run every 10 seconds
  JoinServer.publish({
    context: this,
    name: 'withPromise',
    interval: 10000,
    doJoin() {
      const id = parseInt(Math.random() * 100, 10);

      return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
        .then(res => res.json())
        .then(data => data.title)
        .catch(err => console.error(err));
    },
  });
});
```

##### Client

```javascript
import { JoinClient } from 'meteor-publish-join';

const postId = 'post1';
Meteor.subscribe('test', postId);

// Get the values published within `test` publication. All these values are reactive
JoinClient.get('numComments')
JoinClient.get(`numLikesOfAPost${postId}`)
JoinClient.get('withPromise')

```

## API

### JoinServer.publish(v: Object) [Server]

Use within publication to publish a value to subscriber. Require one argument having following required fields:

- `context`
  + Type: `Object`
  + Desc: the publication context, e.g. `this` inside a publication
- `name`:
  + Type: `String`
  + Desc: name of the published value, will be used by client code to retrieve the value
- `interval`
  + Type: `Number`
  + Desc: the interval time for a value to be re-calculate and publish, accept number in millisecond
- `doJoin`:
  + Type: `Function`
  + Desc: the function used to calculate the published value, got run every `interval` amount of time. Returned value of this function will be published to subscribers. This function also plays nicely with Promise, if a promise is returned the resolved value of that promise will be published
- `log`:
  + Type: `Function`
  + Desc: in case you need to have a different log-function per join. If not provided, `JoinServer.log()` is taken.

##### Example

```javascript
import { JoinServer } from 'meteor-publish-join';

Meteor.publish('example', function(postId) {
  // Publish the number of all comments, re-run every second
  JoinServer.publish({
    context: this,
    name: 'numComments',
    interval: 1000,
    doJoin() {
      return Comment.find().count();
    },
  });
});
```

##### Note

- This package uses a worker runs every 500 milliseconds to check for published values which have passed their `interval` time and required to re-publish. Therefore the actual `interval` value runs from `interval` to `interval + 500`
- The worker of this package is actually a `setTimeout` loop got run every 500 milliseconds. This loop is started by the first call to `JoinServer.publish` and is cleared when the last publication containing a `JoinServer.publish` is stopped

### JoinServer.log(msg: String, level: Integer) [Server]

This method is intended to be overwritten by you and is called by the package internally for you to understand what it actually is busy with. The first parameter holds the message and the second parameter is the priority of the message on a scale from `0`to `7` where `0` is highly critical and `7` is useful information for debugging. The rating is the same as in [RFC 5424](https://tools.ietf.org/html/rfc5424#page-11):

```
0       Emergency: system is unusable
1       Alert: action must be taken immediately
2       Critical: critical conditions
3       Error: error conditions
4       Warning: warning conditions
5       Notice: normal but significant condition
6       Informational: informational messages
7       Debug: debug-level messages
```

By default, every message on a level `< 3` is thrown as an exception, which reflects the behavior before introducing this option.

##### Example how you can use it with [`winston`](https://github.com/winstonjs/winston):

```javascript
import { JoinServer } from 'meteor-publish-join';
import winston from 'winston';

const levels = [ 
  'error',
  'error',
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly'
];

JoinServer.log = (msg, level) => {
  winston.log(levels[level], msg);
};
```

### JoinClient.get(v: String) [Client]

Use in client to obtain the published values. This function is reactive, it could be used in Blaze helpers, Tracker.auto, and other computation block.

##### Example

```javascript
import { JoinClient } from 'meteor-publish-join';

// Use in Blaze helpers
Template.hello.helpers({
  numComments() {
    return JoinClient.get('numComments');
  },
});

// Use in Tracker.autorun
Tracker.autorun(() => {
  console.log(JoinClient.get('numComments'));
});
```

### JoinClient.has(v: String) [Client]

See if a value has been published. This function is reactive, it could be used in Blaze helpers, Tracker.auto, and other computation block.

##### Example

```javascript
import { JoinClient } from 'meteor-publish-join';

// Use in Blaze helpers
Template.hello.helpers({
  numComments() {
    return JoinClient.has('numComments');
  },
});

// Use in Tracker.autorun
Tracker.autorun(() => {
  console.log(JoinClient.has('numComments'));
});
```

## Todos

- [x] Prevent re-run a publish if the last run has not finished
- [ ] Add max waiting time for a publish, mark the publish as finished if it passes its limit
- [ ] Automation test
- [ ] An indicator option to decide if it needs to re-publishing?
- [ ] What's else?

## License

[MIT](LICENSE)
