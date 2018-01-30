'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mergeWith2 = require('lodash/mergeWith');

var _mergeWith3 = _interopRequireDefault(_mergeWith2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

exports.default = elementFactory;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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
  if ((0, _isString3.default)(obj) || (0, _isString3.default)(src)) {
    return false;
  }
  if (!Object.keys(obj).length || !Object.keys(src).length) {
    return false;
  }
  return true;
}

function dontMergeReact(obj, src) {
  if (isMergeable(obj, src)) {
    return (0, _mergeWith3.default)(obj, src, dontMergeReact);
  }
  return src;
}

function elementFactory(Component) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var props = _mergeWith3.default.apply(undefined, [{}].concat(args, [dontMergeReact]));
  return _react2.default.createElement(Component, props);
}