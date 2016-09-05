'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function mapObject(object, foo) {
  return Object.keys(object).map(function (key) {
    return JSON.stringify(key) + ': ' + foo(object[key]);
  });
}

var Scriptifier = function () {
  function Scriptifier(components, opts) {
    _classCallCheck(this, Scriptifier);

    this.components = components;
    this.opts = opts;
    this.stringify = this.stringify.bind(this);
  }

  _createClass(Scriptifier, [{
    key: 'stringifyComponent',
    value: function stringifyComponent(type) {
      if (type[0] === type[0].toUpperCase() && this.components[type]) {
        return 'components.' + type;
      }
      return JSON.stringify(type);
    }
  }, {
    key: 'stringifyReacon',
    value: function stringifyReacon(obj) {
      var type = obj.type;
      var _obj$evalProps = obj.evalProps;
      var evalProps = _obj$evalProps === undefined ? {} : _obj$evalProps;
      var _obj$props = obj.props;
      var props = _obj$props === undefined ? {} : _obj$props;

      return 'React.createElement(' + this.stringifyComponent(type) + ',\n      ' + this.stringifyObject(props, evalProps) + ')';
    }
  }, {
    key: 'stringifyObject',
    value: function stringifyObject(props) {
      var evalProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var propPairs = mapObject(props, this.stringify);
      var evalPropPairs = mapObject(evalProps, _utils.identity);
      var res = [].concat(_toConsumableArray(propPairs), _toConsumableArray(evalPropPairs));
      if (res.length < 1) {
        return '{}';
      }
      return '{' + res.join(',') + '}';
    }
  }, {
    key: 'stringifyArray',
    value: function stringifyArray(props) {
      var _this = this;

      return '[' + props.map(function (item) {
        return _this.stringify(item);
      }).join(',') + ']';
    }
  }, {
    key: 'stringify',
    value: function stringify(obj) {
      if ((0, _utils.isReacon)(obj)) {
        return this.stringifyReacon(obj);
      } else if (_lodash2.default.isArray(obj)) {
        return this.stringifyArray(obj);
      } else if (_lodash2.default.isObject(obj)) {
        return this.stringifyObject(obj);
      }
      return JSON.stringify(obj);
    }
  }, {
    key: 'scriptify',
    value: function scriptify(content) {
      return this.stringify(content);
    }
  }, {
    key: 'scriptComponent',
    value: function scriptComponent(content) {
      var displayName = content.displayName;

      return 'function ' + displayName + '(props) {\n      return ' + this.stringifyReacon(content) + '\n    }';
    }
  }, {
    key: 'runScript',
    value: function runScript(script) {
      return new Function( // eslint-disable-line
      'React', 'components', 'function Component(props) {\n        return ' + script + ';\n      }\n      return Component;')(_react2.default, this.components);
    }
  }, {
    key: 'reactify',
    value: function reactify(content) {
      var script = this.scriptify(content);
      return this.runScript(script);
    }
  }]);

  return Scriptifier;
}();

exports.default = Scriptifier;