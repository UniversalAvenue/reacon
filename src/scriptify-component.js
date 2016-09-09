import React from 'react';
import _ from 'lodash';
import { deepTap } from './utils';

function evalOperator(props, { evalProps }) {
  return evalProps && deepTap(evalProps, s => eval(s), _.isString); // eslint-disable-line
}

function passKey(key) {
  return (nil, conf) => conf[key];
}

function spreadOperator(props, { spread }) {
  return spread && props;
}

const operators = [
  passKey('defaultProps'),
  spreadOperator,
  passKey('props'),
  evalOperator,
];

export default function elementFactory(Component, ...args) {
  const props = _.merge.apply(null, [{}, ...args]);
  return <Component {...props} />;
}