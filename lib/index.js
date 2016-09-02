'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.sliceModifiers = sliceModifiers;
exports.injectParams = injectParams;
exports.inflater = inflater;
exports.reactifier = reactifier;
exports.scriptifier = scriptifier;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactCompose = require('react-compose');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function identity(id) {
  return id;
}

function sliceModifiers(content) {
  if (_lodash2.default.isArray(content)) {
    var lastIdx = content.length - 1;
    return {
      mods: content.slice(0, lastIdx),
      target: content[lastIdx]
    };
  }
  return {
    mods: [],
    target: content
  };
}

function deepTap(obj, tap, isTapable) {
  if (isTapable(obj)) {
    return tap(obj);
  } else if (_lodash2.default.isArray(obj)) {
    return obj.map(function (item) {
      return deepTap(item, tap, isTapable);
    });
  } else if (_lodash2.default.isObject(obj)) {
    return Object.keys(obj).reduce(function (sum, key) {
      return Object.assign(sum, _defineProperty({}, key, deepTap(obj[key], tap, isTapable)));
    }, {});
  }
  return isTapable(obj) ? tap(obj) : obj;
}

function tokenize(str) {
  return new RegExp('^' + str.toUpperCase() + '\\s*(.+)$');
}

function injectParams(injectors) {
  var injs = Object.keys(injectors).map(function (key) {
    return [tokenize(key), injectors[key]];
  });

  function applyInjector(str, params) {
    var match = void 0;
    var found = injs.find(function (i) {
      match = i[0].exec(str);
      return match;
    });
    if (match) {
      return found[1](match[1], params);
    }
    return str;
  }

  return function (content, params) {
    function inject(val) {
      return applyInjector(val, params);
    }
    return deepTap(content, inject, _lodash2.default.isString);
  };
}

function inflater(_ref) {
  var _ref$modifiers = _ref.modifiers;
  var modifiers = _ref$modifiers === undefined ? {} : _ref$modifiers;
  var _ref$injectors = _ref.injectors;
  var injectors = _ref$injectors === undefined ? {} : _ref$injectors;
  var _ref$PromiseRef = _ref.PromiseRef;
  var PromiseRef = _ref$PromiseRef === undefined ? Promise : _ref$PromiseRef;

  var inject = injectParams(injectors);
  function applyModifier(sum, mod) {
    return sum.then(function (outerParams) {
      var _inject = inject(mod, outerParams);

      var type = _inject.type;
      var _inject$params = _inject.params;
      var params = _inject$params === undefined ? {} : _inject$params;
      var props = _inject.props;

      var modification = identity;
      if (type) {
        if (!modifiers[type]) {
          return PromiseRef.reject('Could not find a matching modifier named ' + type);
        }
        modification = modifiers[type];
      }
      return modification(props, _extends({}, outerParams, params));
    });
  }
  return function (content) {
    var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _sliceModifiers = sliceModifiers(content);

    var mods = _sliceModifiers.mods;
    var target = _sliceModifiers.target;

    if (!target) {
      return target;
    }
    return mods.reduce(applyModifier, PromiseRef.resolve(params)).then(function (output) {
      return inject(target, output);
    });
  };
}

function isReacon(obj) {
  return obj && obj.type && _lodash2.default.isString(obj.type);
}

function typeMiddleware(components) {
  return function (content) {
    var type = content.type;

    var rest = _objectWithoutProperties(content, ['type']);

    var _content$props = content.props;
    var props = _content$props === undefined ? {} : _content$props;

    if (!type) {
      throw new Error('Tried to reactify an object without type');
    }
    var Component = components[type];
    if (!Component) {
      if (type[0] === type[0].toUpperCase()) {
        throw new Error('Couldn\'t find a matching component for ' + type);
      }
      Component = type;
    }
    return Component;
  };
}

function propsMiddleware(injs, doReactify) {
  if (injs.length < 1) {
    return function (content, Component) {
      var props = content.props;

      return _react2.default.createElement(Component, doReactify(props));
    };
  }
  function matchInjector(str, key) {
    var match = void 0;
    var found = injs.find(function (i) {
      match = i[0].exec(str);
      return match;
    });
    if (match) {
      return found[1](match[1], key);
    }
    return null;
  }

  function dynamicSplit(props) {
    var dynamics = [];
    var statics = {};
    Object.keys(props).forEach(function (key) {
      var match = matchInjector(props[key], key);
      if (match) {
        dynamics.push(match);
      } else {
        statics[key] = props[key];
      }
    });
    return {
      dynamics: dynamics,
      statics: statics
    };
  }
  return function (content, BaseComponent) {
    var props = content.props;

    var _dynamicSplit = dynamicSplit(props);

    var dynamics = _dynamicSplit.dynamics;
    var statics = _dynamicSplit.statics;

    var Component = BaseComponent;
    if (dynamics.length > 0) {
      Component = (0, _reactCompose.compose)(dynamics)(Component);
    }
    return _react2.default.createElement(Component, doReactify(statics));
  };
}

function reactifier(components) {
  var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref2$injectors = _ref2.injectors;
  var injectors = _ref2$injectors === undefined ? {} : _ref2$injectors;
  var _ref2$middlewares = _ref2.middlewares;
  var middlewares = _ref2$middlewares === undefined ? [] : _ref2$middlewares;

  var injs = Object.keys(injectors).map(function (key) {
    return [tokenize(key), injectors[key]];
  });

  var all = [typeMiddleware(components)].concat(_toConsumableArray(middlewares), [propsMiddleware(injs, doReactify)]);

  function doReactify(content) {
    return deepTap(content, render, isReacon);
  }

  function render(obj) {
    return all.reduce(function (Component, fn) {
      return fn(obj, Component);
    }, null);
  }
  return doReactify;
}

function composeEval(str, key) {
  var fn = function fn(props) {
    try {
      return new Function('with(this) { return ' + str + ' }').call(props);
    } catch (e) {
      console.log('Could not eval ' + str, params);
      return undefined;
    }
  };
  return function (props) {
    return _defineProperty({}, key, fn(props));
  };
}

function scriptifier(components) {
  var _ref4 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  _objectDestructuringEmpty(_ref4);

  function stringifyComponent(type) {
    if (type[0] === type[0].toUpperCase() && components[type]) {
      return type;
    }
    return JSON.stringify(type);
  }

  function stringifyReacon(obj) {
    var type = obj.type;
    var props = obj.props;

    return 'React.createElement(' + stringifyComponent(type) + ', ' + stringify(props) + ')';
  }

  function stringifyObject(props) {
    var val = Object.keys(props).map(function (key) {
      return JSON.stringify(key) + ': ' + stringify(props[key]);
    }).join(', ');
    return '{' + val + '}';
  }

  function stringifyArray(props) {
    return '[' + props.map(function (item) {
      return stringify(item);
    }).join(',') + ']';
  }

  function stringify(obj) {
    if (isReacon(obj)) {
      return stringifyReacon(obj);
    } else if (_lodash2.default.isArray(obj)) {
      return stringifyArray(obj);
    } else if (_lodash2.default.isObject(obj)) {
      return stringifyObject(obj);
    }
    return JSON.stringify(obj);
  }

  function renderBase(obj) {
    return new Function('\n      with(this) {\n        return () => {\n          return ' + stringify(obj) + ';\n        };\n      }\n    ').call(_extends({
      React: _react2.default
    }, components));
  }
  return function (content) {
    return deepTap(content, renderBase, isReacon);
  };
}