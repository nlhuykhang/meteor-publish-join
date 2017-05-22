/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */
/* global before, after */

import { expect } from 'chai';

const { describe, it } = global;

// XXX: this is definitely a bad way to test it. How to make it right??

describe('client get', () => {
  const map = {};

  before(() => {
    global.Meteor = {
      isClient: true,
    };

    global.Mongo = {
      Collection() {
        return {
          findOne({ _id }) {
            return map[_id];
          },
        };
      },
    };
  });

  it('should return undefined if value does not exist', () => {
    const JoinClient = require('../../client/index').default;

    const result = JoinClient.get('test');

    expect(result).to.be.undefined;
  });

  it('should return exact value of id', () => {
    const JoinClient = require('../../client/index').default;

    map.test = {
      value: 'test',
    };

    const result = JoinClient.get('test');

    expect(result).to.equal('test');
  });

  after(() => {
    delete global.Meteor;
    delete global.Mongo;
  });
});
