import React from 'react';
import _ from 'lodash';
import { identity, isReacon } from './utils';

function mapObject(object, foo) {
  return Object.keys(object)
    .map(key =>
      `${JSON.stringify(key)}: ${foo(object[key])}`);
}

export default class Scriptifier {
  constructor({
    locals = new Set(),
  } = {}) {
    this.locals = locals;
    this.stringify = this.stringify.bind(this);
    this.dependencies = new Set();
  }
  stringifyComponent(type) {
    if (type[0] === type[0].toUpperCase()) {
      if (this.locals.has(type)) {
        this.dependencies.add(type);
        return `locals[${JSON.stringify(type)}]`;
      }
      return `components[${JSON.stringify(type)}]`;
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
    const res = [
      ...propPairs,
      ...evalPropPairs,
    ];
    if (res.length < 1) {
      return '{}';
    }
    return `{${res.join(',')}}`;
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
    return this.stringify(content);
  }
  scriptComponent(content) {
    const {
      displayName,
    } = content;
    return `function ${displayName}(props) {
      return ${this.stringifyReacon(content)}
    }`;
  }
  runScript(script, components) {
    return new Function( // eslint-disable-line
      'React',
      'components',
      `function Component(props) {
        return ${script};
      }
      return Component;`
    )(React, components);
  }
  reactify(content, components) {
    const script = this.scriptify(content);
    return this.runScript(script, components);
  }
}
