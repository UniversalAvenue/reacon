'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.injectParams = injectParams;
exports.inflater = inflater;
exports.reactifier = reactifier;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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
    return (0, _utils.deepTap)(content, inject, _lodash2.default.isString);
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

      var modification = _utils.identity;
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

    var _sliceModifiers = (0, _utils.sliceModifiers)(content);

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
  var _ref3 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref3$injectors = _ref3.injectors;
  var injectors = _ref3$injectors === undefined ? {} : _ref3$injectors;
  var _ref3$middlewares = _ref3.middlewares;
  var middlewares = _ref3$middlewares === undefined ? [] : _ref3$middlewares;

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