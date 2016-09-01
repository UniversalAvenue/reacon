import React from 'react';
import _ from 'lodash';

function identity(id) {
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

function deepTap(obj, tap, isTapable = () => true) {
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

function tokenize(str) {
  return new RegExp(`^${str.toUpperCase()}\\s*(.+)$`);
}

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
      if (!_.isString(val)) {
        return val;
      }
      return applyInjector(val, params);
    }
    return deepTap(content, inject);
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
          return PromiseRef.reject(`Could not find a matching modifier named ${type}`);
        }
        modification = modifiers[type];
      }
      return modification(props, {
        ...outerParams,
        ...params,
      });
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

function isReacon(obj) {
  return obj && obj.type && _.isString(obj.type);
}

export function reactifier(components, {
  modifiers,
} = {}) {
  function doReactify(content) {
    return deepTap(content, render, isReacon);
  }

  function render(obj) {
    const {
      type,
      props = {},
    } = obj;
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
    const reactifiedProps = doReactify(props);
    return <Component {...reactifiedProps} />;
  }
  return doReactify;
}
