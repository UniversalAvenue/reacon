'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = elementFactory;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function evalOperator(props, _ref) {
  var evalProps = _ref.evalProps;

  return evalProps && (0, _utils.deepTap)(evalProps, function (s) {
    return eval(s);
  }, _lodash2.default.isString); // eslint-disable-line
}

function passKey(key) {
  return function (nil, conf) {
    return conf[key];
  };
}

function spreadOperator(props, _ref2) {
  var spread = _ref2.spread;

  return spread && props;
}

var operators = [passKey('defaultProps'), spreadOperator, passKey('props'), evalOperator];

function elementFactory(Component) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var props = _lodash2.default.merge.apply(null, [{}].concat(args));
  return _react2.default.createElement(Component, props);
}