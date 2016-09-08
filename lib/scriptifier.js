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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function saferStringify(str) {
  if (_lodash2.default.isString(str)) {
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
  if (!_lodash2.default.isString(str)) {
    return false;
  }
  var match = evalToken.exec(str);
  return match && match[1];
}

var Scriptifier = function () {
  function Scriptifier() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$locals = _ref.locals;
    var locals = _ref$locals === undefined ? [] : _ref$locals;
    var _ref$globals = _ref.globals;
    var globals = _ref$globals === undefined ? [] : _ref$globals;

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
      var type = obj.type;
      var _obj$evalProps = obj.evalProps;
      var evalProps = _obj$evalProps === undefined ? {} : _obj$evalProps;
      var _obj$props = obj.props;
      var props = _obj$props === undefined ? {} : _obj$props;

      var evalObj = (0, _utils.deepTap)(evalProps, function (i) {
        return 'EVAL ' + i;
      });
      var finalProps = _lodash2.default.merge({}, props, evalObj);
      return 'React.createElement(' + this.stringifyComponent(type) + ',\n      ' + this.stringifyObject(finalProps) + ')';
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
      } else if (_lodash2.default.isArray(obj)) {
        return this.stringifyArray(obj);
      } else if (_lodash2.default.isObject(obj)) {
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
  }, {
    key: 'scriptComponent',
    value: function scriptComponent(content) {
      var displayName = content.displayName;

      return 'function ' + displayName + '(props) {\n      return ' + this.stringifyReacon(content) + '\n    }';
    }
  }, {
    key: 'runScript',
    value: function runScript(script, components) {
      return new Function( // eslint-disable-line
      'React', 'components', 'function Component(props) {\n        return ' + script + ';\n      }\n      return Component;')(_react2.default, components);
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