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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

function elementFactory(Component, config, parentProps) {
  var props = _lodash2.default.merge.apply(null, [{}].concat(_toConsumableArray(operators.map(function (op) {
    return op(parentProps, config);
  }))));
  return _react2.default.createElement(Component, props);
}