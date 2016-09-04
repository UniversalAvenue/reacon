import React from 'react';
import _ from 'lodash';
import { identity, deepTap, isReacon } from './utils';

function mapObject(object, foo) {
  return Object.keys(object)
    .map(key =>
      `${JSON.stringify(key)}: ${foo(object[key])}`);
}

export default class Scriptifier {
  constructor(components, opts) {
    this.components = components;
    this.opts = opts;
    this.stringify = this.stringify.bind(this);
  }
  stringifyComponent(type) {
    if (type[0] === type[0].toUpperCase()
        && this.components[type]) {
      return `components.${type}`;
    }
    return JSON.stringify(type);
  }

  stringifyReacon(obj) {
    const {
      type,
      evalProps = {},
      props = {},
    } = obj;
    return `React.createElement(${this.stringifyComponent(type)},
      ${this.stringifyObject(props, evalProps)})`;
  }

  stringifyObject(props, evalProps = {}) {
    const propPairs = mapObject(props, this.stringify);
    const evalPropPairs = mapObject(evalProps, identity);
    const str = [
      propPairs,
      evalPropPairs,
    ].join(',');
    return `{${str}}`;
  }

  stringifyArray(props) {
    return `[${props.map(item => this.stringify(item)).join(',')}]`;
  }

  stringify(obj) {
    if (isReacon(obj)) {
      return this.stringifyReacon(obj);
    } else if (_.isArray(obj)) {
      return this.stringifyArray(obj);
    } else if (_.isObject(obj)) {
      return this.stringifyObject(obj);
    }
    return JSON.stringify(obj);
  }
  scriptify(content) {
    const body = this.stringify(content);
    return `function Component(props) {
        return ${body};
      }
      return Component;`;
  }
  runScript(script) {
    return new Function(
      'React',
      'components',
      script
    )(React, this.components);
  }
  reactify(content) {
    const script = this.scriptify(content);
    return this.runScript(script);
  }
}
