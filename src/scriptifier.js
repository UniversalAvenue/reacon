import _ from 'lodash';
import { tokenize, isReacon } from './utils';
import factory from './factory';

function saferStringify(str) {
  if (_.isString(str)) {
    return JSON.stringify(str.replace(/[\u2028\u2029]/g, ''));
  }
  return JSON.stringify(str);
}

function mapObject(object, foo) {
  return Object.keys(object)
    .map(key =>
      `${saferStringify(key)}: ${foo(object[key])}`);
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
    locals = [],
    globals = [],
  } = {}) {
    this.locals = new Set(locals);
    this.globals = new Set(globals);
    this.stringify = this.stringify.bind(this);
    this.dependencies = new Set();
  }
  stringifyComponent(type) {
    if (type[0] === type[0].toUpperCase()) {
      if (this.locals.has(type)) {
        this.dependencies.add(type);
        return `locals[${saferStringify(type)}]`;
      }
      if (!this.globals.has(type)) {
        throw new Error(`All external components need be whitelisted, ${type} is not on that list`);
      }
      return `components[${saferStringify(type)}]`;
    }
    return saferStringify(type);
  }

  stringifyReacon(obj) {
    return `factory(${this.stringifyComponent(obj.type)},
      ${this.stringifyObject(obj)}, props)`;
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
    return saferStringify(obj);
  }
  scriptify(content) {
    return this.stringify(content);
  }
  runScript(script, components) {
    return new Function( // eslint-disable-line
      'factory',
      'components',
      `function Component(props) {
        return ${script};
      }
      return Component;`
    )(factory, components);
  }
  reactify(content, components) {
    const script = this.scriptify(content);
    return this.runScript(script, components);
  }
}
