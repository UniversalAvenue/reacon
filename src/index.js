import React from 'react';
import _ from 'lodash';
import {
  tokenize,
  sliceModifiers,
  identity,
  isReacon,
  deepTap,
} from './utils';

export function injectParams(injectors) {
  const injs = Object.keys(injectors)
    .map(key => [tokenize(key), injectors[key]]);

  function applyInjector(str, params) {
    let match;
    const found = injs.find(i => {
      match = i[0].exec(str);
      return match;
    });
    if (match) {
      return found[1](match[1], params);
    }
    return str;
  }

  return (content, params) => {
    function inject(val) {
      return applyInjector(val, params);
    }
    return deepTap(content, inject, _.isString);
  };
}

export function inflater({
  modifiers = {},
  injectors = {},
  PromiseRef = Promise,
}) {
  const inject = injectParams(injectors);
  function applyModifier(sum, mod) {
    return sum.then(outerParams => {
      const {
        type,
        params = {},
        props,
      } = inject(mod, outerParams);
      let modification = identity;
      if (type) {
        if (!modifiers[type]) {
          throw new Error(`Could not find a matching modifier named ${type}`);
        }
        modification = modifiers[type];
      }
      return PromiseRef.resolve(modification(props, {
        ...outerParams,
        ...params,
      })).then(res => Object.assign(outerParams, res));
    });
  }
  return (content, params = {}) => {
    const {
      mods,
      target,
    } = sliceModifiers(content);
    if (!target) {
      return target;
    }
    return mods.reduce(applyModifier, PromiseRef.resolve(params))
      .then(output => inject(target, output));
  };
}

function typeMiddleware(components) {
  return ({
    type,
  }) => {
    if (!type) {
      throw new Error('Tried to reactify an object without type');
    }
    let Component = components[type];
    if (!Component) {
      if (type[0] === type[0].toUpperCase()) {
        throw new Error(`Couldn\'t find a matching component for ${type}`);
      }
      Component = type;
    }
    return Component;
  };
}

function propsMiddleware(injs, doReactify) {
  if (injs.length < 1) {
    return (content, Component) => {
      const {
        props,
      } = content;
      return <Component {...doReactify(props)} />;
    };
  }
  return (content, Component) => {
    const {
      props,
    } = content;
    return <Component {...doReactify(props)} />;
  };
}

export function reactifier(components, {
  injectors = {},
  middlewares = [],
} = {}) {
  const injs = Object.keys(injectors)
    .map(key => [tokenize(key), injectors[key]]);

  function render(obj) {
    return all.reduce((Component, fn) => fn(obj, Component), null); // eslint-disable-line
  }

  function doReactify(content) {
    return deepTap(content, render, isReacon);
  }

  const all = [
    typeMiddleware(components),
    ...middlewares,
    propsMiddleware(injs, doReactify),
  ];
  return doReactify;
}
