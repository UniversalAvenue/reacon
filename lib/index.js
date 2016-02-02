'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reactify = exports.compile = exports.inject = exports.interpolate = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var reducer = function reducer(fn) {
  return function (sum, str, key) {
    sum[key] = fn(str, key);
    return sum;
  };
};

var template = function template(str) {
  var compiled = _lodash2.default.template(str);
  return function () {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return compiled({ data: data, props: props });
  };
};

var getter = function getter(str) {
  return function () {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return _lodash2.default.get({ data: data, props: props }, str);
  };
};

var templatePattern = /^TEMPLATE (.+)$/;
var getterPattern = /^GET (.+)$/;

var parsers = [{ pattern: templatePattern, fn: template }, { pattern: getterPattern, fn: getter }];

var parse = function parse() {
  var str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  var result = function result() {
    return str;
  };
  _lodash2.default.find(parsers, function (_ref) {
    var pattern = _ref.pattern;
    var fn = _ref.fn;

    if (!pattern) {
      return true;
    }
    var match = pattern.exec(str);
    if (match && match[1]) {
      result = fn(match[1]);
      return true;
    }
    return false;
  });
  return result;
};

var interpolate = exports.interpolate = function interpolate() {
  var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (_lodash2.default.keys(args).length < 1) {
    return args;
  }
  return _lodash2.default.reduce(args, reducer(function (str) {
    if (_lodash2.default.isArray(str)) {
      return str.map(function (s) {
        return interpolate(s);
      });
    }
    if (_lodash2.default.isObject(str)) {
      return interpolate(str);
    }
    if (_lodash2.default.isString(str)) {
      return parse(str);
    }
    return str;
  }), {});
};

var inject = exports.inject = function inject(compiled) {
  return function () {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (_lodash2.default.isFunction(compiled)) {
      return compiled(data, props);
    }
    if (_lodash2.default.isArray(compiled)) {
      return compiled.map(function (c) {
        return c(data, props);
      });
    }
    if (!_lodash2.default.isObject(compiled) || _lodash2.default.keys(compiled).length < 1) {
      return compiled;
    }
    return _lodash2.default.reduce(compiled, reducer(function (fn) {
      if (_lodash2.default.isFunction(fn)) {
        return fn(data, props);
      }
      if (_lodash2.default.isArray(fn)) {
        return _lodash2.default.map(fn, function (fnn) {
          return inject(fnn)(data, props);
        });
      }
      return inject(fn)(data, props);
    }), {});
  };
};

var compile = exports.compile = function compile(node) {
  var map = arguments.length <= 1 || arguments[1] === undefined ? function (id) {
    return id;
  } : arguments[1];

  if (_lodash2.default.isString(node)) {
    var fn = inject(parse(node));
    return fn;
  }
  if (_lodash2.default.keys(node) < 1) {
    return function () {
      return node;
    };
  }
  var propsFn = interpolate(_lodash2.default.omit(node, 'children', 'component'));
  var children = node.children;
  if (_lodash2.default.isString(children)) {
    propsFn.children = parse(children);
  } else if (_lodash2.default.isArray(children)) {
    (function () {
      var tmp = children.map(function (child) {
        return compile(child, map);
      });
      propsFn.children = function (data, props) {
        return tmp.map(function (fn) {
          return fn(data, props);
        });
      };
    })();
  } else if (_lodash2.default.isObject(children)) {
    propsFn.children = compile(children, map);
  } else if (children) {
    propsFn.children = children;
  }
  return function (data, staticProps) {
    var props = inject(propsFn)(data, staticProps);
    return map(_extends({
      component: node.component
    }, staticProps, props));
  };
};

var reactify = exports.reactify = function reactify(node) {
  var components = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var result = compile(node, function (_ref2) {
    var component = _ref2.component;

    var props = _objectWithoutProperties(_ref2, ['component']);

    var Component = components[component] || component;
    return _react2.default.createElement(Component, props);
  });

  return function (data) {
    return function (props) {
      return result(data, props);
    };
  };
};