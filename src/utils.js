import React from 'react';
import _ from 'lodash';

export function identity(id) {
  return id;
}

export function sliceModifiers(content) {
  if (_.isArray(content)) {
    const lastIdx = content.length - 1;
    return {
      mods: content.slice(0, lastIdx),
      target: content[lastIdx],
    };
  }
  return {
    mods: [],
    target: content,
  };
}

export function deepTap(obj, tap, isTapable) {
  if (isTapable(obj)) {
    return tap(obj);
  } else if (_.isArray(obj)) {
    return obj.map(item => deepTap(item, tap, isTapable));
  } else if (_.isObject(obj)) {
    return Object.keys(obj)
      .reduce((sum, key) => Object.assign(sum, {
        [key]: deepTap(obj[key], tap, isTapable),
      }), {});
  }
  return isTapable(obj) ? tap(obj) : obj;
}

export function tokenize(str) {
  return new RegExp(`^${str.toUpperCase()}\\s*(.+)$`);
}


export function isReacon(obj) {
  return obj && obj.type && _.isString(obj.type);
}

