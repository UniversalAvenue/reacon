'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isObject2 = require('lodash/isObject');

var _isObject3 = _interopRequireDefault(_isObject2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _factory = require('./factory');

var _factory2 = _interopRequireDefault(_factory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function saferStringify(str) {
  if ((0, _isString3.default)(str)) {
    return JSON.stringify(str.replace(/[\u2028\u2029]/g, ''));
  }
  return JSON.stringify(str);
}

function mapObject(object, foo) {
  return Object.keys(object).map(function (key) {
    return saferStringify(key) + ': ' + foo(object[key]);
  });
}

var evalToken = (0, _utils.tokenize)('EVAL');

function isEval(str) {
  if (!(0, _isString3.default)(str)) {
    return false;
  }
  var match = evalToken.exec(str);
  return match && match[1];
}

var Scriptifier = function () {
  function Scriptifier() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$locals = _ref.locals,
        locals = _ref$locals === undefined ? [] : _ref$locals,
        _ref$globals = _ref.globals,
        globals = _ref$globals === undefined ? [] : _ref$globals;

    _classCallCheck(this, Scriptifier);

    this.locals = new Set(locals);
    this.globals = new Set(globals);
    this.stringify = this.stringify.bind(this);
    this.dependencies = new Set();
  }

  _createClass(Scriptifier, [{
    key: 'stringifyComponent',
    value: function stringifyComponent(type) {
      if (type[0] === type[0].toUpperCase()) {
        if (this.locals.has(type)) {
          this.dependencies.add(type);
          return 'locals[' + saferStringify(type) + ']';
        }
        if (!this.globals.has(type)) {
          throw new Error('All external components need be whitelisted, ' + type + ' is not on that list');
        }
        return 'components[' + saferStringify(type) + ']';
      }
      return saferStringify(type);
    }
  }, {
    key: 'stringifyReacon',
    value: function stringifyReacon(obj) {
      var type = obj.type,
          defaultProps = obj.defaultProps,
          spread = obj.spread,
          props = obj.props,
          evalProps = obj.evalProps;

      var args = [this.stringifyComponent(type), defaultProps && this.stringifyObject(defaultProps), spread && 'props', props && this.stringifyObject(props), evalProps && this.stringifyObject((0, _utils.deepTap)(evalProps, function (str) {
        return 'EVAL ' + str;
      }, _isString3.default))].filter(function (t) {
        return t;
      });
      return 'factory(' + args.join(', ') + ')';
    }
  }, {
    key: 'stringifyObject',
    value: function stringifyObject(obj) {
      var res = mapObject(obj, this.stringify);
      if (res.length < 1) {
        return '{}';
      }
      return '{' + res.join(',') + '}';
    }
  }, {
    key: 'stringifyArray',
    value: function stringifyArray(props) {
      return '[' + props.map(this.stringify).join(',') + ']';
    }
  }, {
    key: 'stringify',
    value: function stringify(obj) {
      if ((0, _utils.isReacon)(obj)) {
        return this.stringifyReacon(obj);
      } else if ((0, _isArray3.default)(obj)) {
        return this.stringifyArray(obj);
      } else if ((0, _isObject3.default)(obj)) {
        return this.stringifyObject(obj);
      }
      var evalStr = isEval(obj);
      if (evalStr) {
        return evalStr;
      }
      return saferStringify(obj);
    }
  }, {
    key: 'scriptify',
    value: function scriptify(content) {
      return this.stringify(content);
    }
    // eslint-disable-next-line

  }, {
    key: 'runScript',
    value: function runScript(script, components) {
      return new Function( // eslint-disable-line
      'factory', 'components', 'function Component(props) {\n        return ' + script + ';\n      }\n      return Component;')(_factory2.default, components);
    }
  }, {
    key: 'reactify',
    value: function reactify(content, components) {
      var script = this.scriptify(content);
      return this.runScript(script, components);
    }
  }]);

  return Scriptifier;
}();

exports.default = Scriptifier;