import React from 'react';
import _ from 'lodash';

const reducer = fn => (sum, str, key) => {
  sum[key] = fn(str, key);
  return sum;
};


const template = (str) => {
  const compiled = _.template(str);
  return (data = {}, props = {}) => {
    return compiled({ data, props });
  };
};

const getter = (str) => {
  return (data = {}, props = {}) => {
    return _.get({ data, props }, str);
  };
};

const templatePattern = /^TEMPLATE (.+)$/;
const getterPattern = /^GET (.+)$/;

const parsers = [
  { pattern: templatePattern, fn: template },
  { pattern: getterPattern, fn: getter },
];

const parse = (str = '') => {
  let result = () => str;
  _.find(parsers, ({ pattern, fn }) => {
    if (!pattern) {
      return true;
    }
    const match = pattern.exec(str);
    if (match && match[1]) {
      result = fn(match[1]);
      return true;
    }
    return false;
  });
  return result;
};

export const interpolate = (args = {}) => {
  return _.reduce(args, reducer(str => {
    if (_.isArray(str)) {
      return str.map(s => interpolate(s));
    }
    if (_.isObject(str)) {
      return interpolate(str);
    }
    if (_.isString(str)) {
      return parse(str);
    }
    return str;
  }), {});
};

export const inject = (compiled) => (data = {}, props = {}) => {
  if (_.isFunction(compiled)) {
    return compiled(data, props);
  }
  if (!_.isObject(compiled) || _.keys(compiled).length < 1) {
    return compiled;
  }
  return _.reduce(compiled, reducer(fn => {
    if (_.isFunction(fn)) {
      return fn(data, props);
    }
    if (_.isArray(fn)) {
      return _.map(fn, fnn => inject(fnn)(data, props));
    }
    return inject(fn)(data, props);
  }), {});
};

export const compile = (node, map = id => id) => {
  const propsFn = interpolate(_.omit(node, 'children', 'component'));
  const children = node.children;
  if (_.isString(children)) {
    propsFn.children = parse(children);
  } else if (_.isArray(children)) {
    const tmp = children.map(child => compile(child, map));
    propsFn.children = data => tmp.map(fn => fn(data));
  } else if (_.isObject(children)) {
    propsFn.children = compile(children, map);
  } else if (children) {
    propsFn.children = children;
  }
  return (data, staticProps) => {
    const props = inject(propsFn)(data, staticProps);
    return map({
      component: node.component,
      ...staticProps,
      ...props,
    });
  };
};

export const reactify = (node, components = {}) => {
  const result = compile(node, ({ component, ...props }) => {
    const Component = components[component] || component;
    return <Component {...props}/>;
  });

  return data => props => result(data, props);
};
