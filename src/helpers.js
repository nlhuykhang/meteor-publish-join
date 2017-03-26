export function isObject(object) {
  return typeof object === 'object' && !!object;
}

export function isString(str) {
  return Object.prototype.toString.call(str) === '[object String]';
}

export function isNumber(number) {
  return Object.prototype.toString.call(number) === '[object Number]';
}

export function isFunction(func) {
  return Object.prototype.toString.call(func) === '[object Function]';
}

export function isUndefined(value) {
  return value === undefined;
}

export function throwError(mes) {
  throw new Error(mes);
}
