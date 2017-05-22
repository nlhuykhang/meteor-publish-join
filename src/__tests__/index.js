// import './helpers.test.js';

// /* eslint-disable no-unused-expressions */
//
// import { expect } from 'chai';
// const { describe, it } = global;
//
// import {
//   isObject,
//   isString,
//   isNumber,
//   isFunction,
//   isUndefined,
//   throwError,
//   isBoolean,
// } from '../helpers.js';
//
// describe('isObject', () => {
//   it('should return true with a plain object', () => {
//     const result = isObject({});
//     expect(result).to.be.true;
//   });
//
//   it('should return true with a normal object', () => {
//     const result = isObject({ a: 1, b: 2 });
//     expect(result).to.be.true;
//   });
//
//   it('should return false with number', () => {
//     const result = isObject(11);
//     expect(result).to.be.false;
//   });
//
//   it('should return false with string', () => {
//     const result = isObject('qwe');
//     expect(result).to.be.false;
//   });
//
//   it('should return false with boolean', () => {
//     const result = isObject(true);
//     expect(result).to.be.false;
//   });
//
//   it('should return false with null', () => {
//     const result = isObject(null);
//     expect(result).to.be.false;
//   });
//
//   it('should return false with undefined', () => {
//     const result = isObject(undefined);
//     expect(result).to.be.false;
//   });
// });
