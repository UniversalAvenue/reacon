'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = elementFactory;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isMergeable(obj, src) {
  if (!obj || !src) {
    return false;
  }
  if (src && src.$$typeof) {
    return false;
  }
  if (obj && obj.$$typeof) {
    return false;
  }
  if (_lodash2.default.isString(obj) || _lodash2.default.isString(src)) {
    return false;
  }
  if (!Object.keys(obj).length || !Object.keys(src).length) {
    return false;
  }
  return true;
}

function dontMergeReact(obj, src) {
  if (isMergeable(obj, src)) {
    return _lodash2.default.mergeWith(obj, src, dontMergeReact);
  }
  return src;
}

function elementFactory(Component) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var props = _lodash2.default.mergeWith.apply(_lodash2.default, [{}].concat(args, [dontMergeReact]));
  return _react2.default.createElement(Component, props);
}