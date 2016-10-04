import React from 'react';
import _ from 'lodash';

function isMergeable(obj, src) {
  if (!obj || !src) {
    return false;
  }
  if (src && src.$$typeof) {
    return false;
  }
  if (obj && obj.$$typeof) {
    return false;
  }
  if (_.isString(obj) || _.isString(src)) {
    return false;
  }
  if (!Object.keys(obj).length || !Object.keys(src).length) {
    return false;
  }
  return true;
}

function dontMergeReact(obj, src) {
  if (isMergeable(obj, src)) {
    return _.mergeWith(obj, src, dontMergeReact);
  }
  return src;
}

export default function elementFactory(Component, ...args) {
  const props = _.mergeWith({}, ...args, dontMergeReact);
  return <Component {...props} />;
}
