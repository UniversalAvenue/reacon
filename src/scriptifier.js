import React from 'react';
import _ from 'lodash';
import { tokenize, isReacon, deepTap } from './utils';

function mapObject(object, foo) {
  return Object.keys(object)
    .map(key =>
      `${JSON.stringify(key)}: ${foo(object[key])}`);
}

const evalToken = tokenize('EVAL');

function isEval(str) {
  if (!_.isString(str)) {
    return false;
  }
  const match = evalToken.exec(str);
  return match && match[1];
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
    const evalObj = deepTap(evalProps, i => `EVAL ${i}`);
    const finalProps = _.merge({}, props, evalObj);
    return `React.createElement(${this.stringifyComponent(type)},
      ${this.stringifyObject(finalProps)})`;
  }

  stringifyObject(obj) {
    const res = mapObject(obj, this.stringify);
    if (res.length < 1) {
      return '{}';
    }
    return `{${res.join(',')}}`;
  }

  stringifyArray(props) {
    return `[${props.map(this.stringify).join(',')}]`;
  }

  stringify(obj) {
    if (isReacon(obj)) {
      return this.stringifyReacon(obj);
    } else if (_.isArray(obj)) {
      return this.stringifyArray(obj);
    } else if (_.isObject(obj)) {
      return this.stringifyObject(obj);
    }
    const evalStr = isEval(obj);
    if (evalStr) {
      return evalStr;
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
