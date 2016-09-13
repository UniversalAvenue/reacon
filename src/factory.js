import React from 'react';
import _ from 'lodash';

export default function elementFactory(Component, ...args) {
  const props = _.merge.apply(null, [{}, ...args]);
  return <Component {...props} />;
}
