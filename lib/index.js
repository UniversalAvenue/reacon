'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.injectParams = injectParams;
exports.inflater = inflater;
exports.reactifier = reactifier;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function injectParams(injectors) {
  var injs = Object.keys(injectors).map(function (key) {
    return [(0, _utils.tokenize)(key), injectors[key]];
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
    return (0, _utils.deepTap)(content, inject, _isString3.default);
  };
}

function inflater(_ref) {
  var _ref$modifiers = _ref.modifiers,
      modifiers = _ref$modifiers === undefined ? {} : _ref$modifiers,
      _ref$injectors = _ref.injectors,
      injectors = _ref$injectors === undefined ? {} : _ref$injectors,
      _ref$PromiseRef = _ref.PromiseRef,
      PromiseRef = _ref$PromiseRef === undefined ? Promise : _ref$PromiseRef;

  var inject = injectParams(injectors);
  function applyModifier(sum, mod) {
    return sum.then(function (outerParams) {
      var _inject = inject(mod, outerParams),
          type = _inject.type,
          _inject$params = _inject.params,
          params = _inject$params === undefined ? {} : _inject$params,
          props = _inject.props;

      var modification = _utils.identity;
      if (type) {
        if (!modifiers[type]) {
          throw new Error('Could not find a matching modifier named ' + type);
        }
        modification = modifiers[type];
      }
      return PromiseRef.resolve(modification(props, _extends({}, outerParams, params))).then(function (res) {
        return Object.assign(outerParams, res);
      });
    });
  }
  return function (content) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _sliceModifiers = (0, _utils.sliceModifiers)(content),
        mods = _sliceModifiers.mods,
        target = _sliceModifiers.target;

    if (!target) {
      return target;
    }
    return mods.reduce(applyModifier, PromiseRef.resolve(params)).then(function (output) {
      return inject(target, output);
    });
  };
}

function typeMiddleware(components) {
  return function (_ref2) {
    var type = _ref2.type;

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
  return function (content, Component) {
    var props = content.props;

    return _react2.default.createElement(Component, doReactify(props));
  };
}

function reactifier(components) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref3$injectors = _ref3.injectors,
      injectors = _ref3$injectors === undefined ? {} : _ref3$injectors,
      _ref3$middlewares = _ref3.middlewares,
      middlewares = _ref3$middlewares === undefined ? [] : _ref3$middlewares;

  var injs = Object.keys(injectors).map(function (key) {
    return [(0, _utils.tokenize)(key), injectors[key]];
  });

  function render(obj) {
    return all.reduce(function (Component, fn) {
      return fn(obj, Component);
    }, null); // eslint-disable-line
  }

  function doReactify(content) {
    return (0, _utils.deepTap)(content, render, _utils.isReacon);
  }

  var all = [typeMiddleware(components)].concat(_toConsumableArray(middlewares), [propsMiddleware(injs, doReactify)]);
  return doReactify;
}