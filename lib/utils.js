'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _isObject2 = require('lodash/isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

exports.identity = identity;
exports.sliceModifiers = sliceModifiers;
exports.deepTap = deepTap;
exports.tokenize = tokenize;
exports.isReacon = isReacon;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function identity(id) {
  return id;
}

function sliceModifiers(content) {
  if ((0, _isArray3.default)(content)) {
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
  var keyMap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : identity;

  if (isTapable && isTapable(obj)) {
    return tap(obj);
  } else if ((0, _isArray3.default)(obj)) {
    return obj.map(function (item) {
      return deepTap(item, tap, isTapable);
    });
  } else if ((0, _isObject3.default)(obj)) {
    return Object.keys(obj).reduce(function (sum, key) {
      return Object.assign(sum, _defineProperty({}, keyMap(key), deepTap(obj[key], tap, isTapable)));
    }, {});
  }
  if (isTapable) {
    return isTapable(obj) ? tap(obj) : obj;
  }
  return tap(obj);
}

function tokenize(str) {
  return new RegExp('^' + str.toUpperCase() + '\\s*(.+)$');
}

function isReacon(obj) {
  return obj && obj.type && (0, _isString3.default)(obj.type);
}