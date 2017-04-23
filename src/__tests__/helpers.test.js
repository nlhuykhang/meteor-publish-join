/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import {
  isObject,
  isString,
  isNumber,
  isFunction,
  isUndefined,
  throwError,
  isBoolean,
} from '../helpers';

const { describe, it } = global;

describe('isObject', () => {
  it('should return true with a plain object', () => {
    const result = isObject({});
    expect(result).to.be.true;
  });

  it('should return true with a normal object', () => {
    const result = isObject({ a: 1, b: 2 });
    expect(result).to.be.true;
  });

  it('should return false with number', () => {
    const result = isObject(11);
    expect(result).to.be.false;
  });

  it('should return false with string', () => {
    const result = isObject('qwe');
    expect(result).to.be.false;
  });

  it('should return false with boolean', () => {
    const result = isObject(true);
    expect(result).to.be.false;
  });

  it('should return false with null', () => {
    const result = isObject(null);
    expect(result).to.be.false;
  });

  it('should return false with undefined', () => {
    const result = isObject(undefined);
    expect(result).to.be.false;
  });
});

describe('isString', () => {
  it('should return true with an empty string', () => {
    const result = isString('');
    expect(result).to.be.true;
  });

  it('should return true with a normal string', () => {
    const result = isString('werewr');
    expect(result).to.be.true;
  });

  it('should return false with number', () => {
    const result = isString(11);
    expect(result).to.be.false;
  });

  it('should return false with object', () => {
    const result = isString({});
    expect(result).to.be.false;
  });

  it('should return false with boolean', () => {
    const result = isString(true);
    expect(result).to.be.false;
  });

  it('should return false with null', () => {
    const result = isString(null);
    expect(result).to.be.false;
  });

  it('should return false with undefined', () => {
    const result = isString(undefined);
    expect(result).to.be.false;
  });
});

describe('isNumber', () => {
  it('should return true with a number', () => {
    const result = isNumber(12);
    expect(result).to.be.true;
  });

  it('should return false with string', () => {
    const result = isNumber('11');
    expect(result).to.be.false;
  });

  it('should return false with object', () => {
    const result = isNumber({});
    expect(result).to.be.false;
  });

  it('should return false with boolean', () => {
    const result = isNumber(true);
    expect(result).to.be.false;
  });

  it('should return false with null', () => {
    const result = isNumber(null);
    expect(result).to.be.false;
  });

  it('should return false with undefined', () => {
    const result = isNumber(undefined);
    expect(result).to.be.false;
  });
});

describe('isFunction', () => {
  it('should return true with a function declaration', () => {
    // eslint-disable-next-line
    const result = isFunction(function test() {});
    expect(result).to.be.true;
  });

  it('should return true with a function expression', () => {
    const f = function test() {};
    const result = isFunction(f);
    expect(result).to.be.true;
  });

  it('should return false with string', () => {
    const result = isFunction('11');
    expect(result).to.be.false;
  });

  it('should return false with object', () => {
    const result = isFunction({});
    expect(result).to.be.false;
  });

  it('should return false with boolean', () => {
    const result = isFunction(true);
    expect(result).to.be.false;
  });

  it('should return false with null', () => {
    const result = isFunction(null);
    expect(result).to.be.false;
  });

  it('should return false with undefined', () => {
    const result = isFunction(undefined);
    expect(result).to.be.false;
  });
});

describe('isUndefined', () => {
  it('should return false with a number', () => {
    const result = isUndefined(12);
    expect(result).to.be.false;
  });

  it('should return false with string', () => {
    const result = isUndefined('11');
    expect(result).to.be.false;
  });

  it('should return false with object', () => {
    const result = isUndefined({});
    expect(result).to.be.false;
  });

  it('should return false with boolean', () => {
    const result = isUndefined(true);
    expect(result).to.be.false;
  });

  it('should return false with null', () => {
    const result = isUndefined(null);
    expect(result).to.be.false;
  });

  it('should return false with function', () => {
    // eslint-disable-next-line
    const result = isUndefined(function() {});
    expect(result).to.be.false;
  });

  it('should return true with undefined', () => {
    const result = isUndefined(undefined);
    expect(result).to.be.true;
  });
});

describe('isBoolean', () => {
  it('should return false with a number', () => {
    const result = isBoolean(12);
    expect(result).to.be.false;
  });

  it('should return false with string', () => {
    const result = isBoolean('11');
    expect(result).to.be.false;
  });

  it('should return false with object', () => {
    const result = isBoolean({});
    expect(result).to.be.false;
  });

  it('should return true with true', () => {
    const result = isBoolean(true);
    expect(result).to.be.true;
  });

  it('should return true with false', () => {
    const result = isBoolean(false);
    expect(result).to.be.true;
  });

  it('should return false with null', () => {
    const result = isBoolean(null);
    expect(result).to.be.false;
  });

  it('should return false with function', () => {
    // eslint-disable-next-line
    const result = isBoolean(function() {});
    expect(result).to.be.false;
  });

  it('should return false with undefined', () => {
    const result = isBoolean(undefined);
    expect(result).to.be.false;
  });
});

describe('throwError', () => {
  it('should throw error with message', () => {
    expect(throwError.bind(undefined, 'test')).to.throw(/test/);
  });
});
