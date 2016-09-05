'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.identity = identity;
exports.sliceModifiers = sliceModifiers;
exports.deepTap = deepTap;
exports.tokenize = tokenize;
exports.isReacon = isReacon;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  var keyMap = arguments.length <= 3 || arguments[3] === undefined ? identity : arguments[3];

  if (isTapable && isTapable(obj)) {
    return tap(obj);
  } else if (_lodash2.default.isArray(obj)) {
    return obj.map(function (item) {
      return deepTap(item, tap, isTapable);
    });
  } else if (_lodash2.default.isObject(obj)) {
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
  return obj && obj.type && _lodash2.default.isString(obj.type);
}