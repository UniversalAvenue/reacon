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

function elementFactory(Component) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var props = _lodash2.default.merge.apply(null, [{}].concat(args));
  return _react2.default.createElement(Component, props);
}