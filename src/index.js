import React from 'react';
import _ from 'lodash';
import { compose } from 'react-compose';

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

function deepTap(obj, tap, isTapable) {
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

function typeMiddleware(components) {
  return (content) => {
    const {
      type,
      ...rest,
      props = {},
    } = content;
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
  function matchInjector(str, key) {
    let match;
    const found = injs.find(i => {
      match = i[0].exec(str);
      return match;
    });
    if (match) {
      return found[1](match[1], key);
    }
    return null;
  }

  function dynamicSplit(props) {
    const dynamics = [];
    const statics = {};
    Object.keys(props).forEach(key => {
      const match = matchInjector(props[key], key);
      if (match) {
        dynamics.push(match);
      } else {
        statics[key] = props[key];
      }
    });
    return {
      dynamics,
      statics,
    };
  }
  return (content, BaseComponent)  => {
    const {
      props,
    } = content;
    const {
      dynamics,
      statics,
    } = dynamicSplit(props);
    let Component = BaseComponent;
    if (dynamics.length > 0) {
      Component = compose(dynamics)(Component);
    }
    return <Component {...doReactify(statics)} />;
  };
}

export function reactifier(components, {
  injectors = {},
  middlewares = [],
} = {}) {
  const injs = Object.keys(injectors)
    .map(key => [tokenize(key), injectors[key]]);

  const all = [
    typeMiddleware(components),
    ...middlewares,
    propsMiddleware(injs, doReactify),
  ];

  function doReactify(content) {
    return deepTap(content, render, isReacon);
  }

  function render(obj) {
    return all.reduce((Component, fn) => fn(obj, Component), null);
  }
  return doReactify;
}


function composeEval(str, key) {
  const fn = props => {
    try {
      return (new Function(`with(this) { return ${str} }`)).call(props);
    } catch (e) {
      console.log(`Could not eval ${str}`, params);
      return undefined;
    }
  };
  return props => ({
    [key]: fn(props),
  });
}


export function scriptifier(components, {
} = {}) {

  function doReactify(content) {
    return deepTap(content, render, isReacon);
  }

  function renderBase(obj) {
    const {
      type,
      props,
    } = obj;
    return new Function(`
      with(this) {
        return React.createElement("${type}", ${JSON.stringify(props)});
      }
    `);
  }
  return content => deepTap(content, renderBase, isReacon);
}
