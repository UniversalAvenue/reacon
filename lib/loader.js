'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _graphDataStructure = require('graph-data-structure');

var _graphDataStructure2 = _interopRequireDefault(_graphDataStructure);

var _scriptifier = require('./scriptifier');

var _scriptifier2 = _interopRequireDefault(_scriptifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Loader = function () {
  function Loader() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$blocks = _ref.blocks;
    var blocks = _ref$blocks === undefined ? {} : _ref$blocks;
    var _ref$PromiseRef = _ref.PromiseRef;
    var PromiseRef = _ref$PromiseRef === undefined ? Promise : _ref$PromiseRef;
    var _ref$scriptMapper = _ref.scriptMapper;
    var scriptMapper = _ref$scriptMapper === undefined ? function (content) {
      return Promise.resolve(content);
    } : _ref$scriptMapper;
    var entryMapper = _ref.entryMapper;

    _classCallCheck(this, Loader);

    this.blocks = blocks;
    this.scripts = {};
    this.PromiseRef = PromiseRef;
    this.scriptMapper = scriptMapper;
    this.entryMapper = entryMapper || scriptMapper;
  }

  _createClass(Loader, [{
    key: 'scriptify',
    value: function scriptify(content, isEntry) {
      var scriptifier = new _scriptifier2.default({
        locals: new Set(Object.keys(this.blocks))
      });
      return (isEntry ? this.entryMapper(content) : this.scriptMapper(content)).then(function (c) {
        return scriptifier.scriptify(c);
      }).then(function (script) {
        return {
          script: script,
          dependencies: Array.from(scriptifier.dependencies)
        };
      });
    }
  }, {
    key: 'scriptifyBlock',
    value: function scriptifyBlock(name) {
      if (!this.scripts[name]) {
        this.scripts[name] = this.scriptify(this.blocks[name]);
      }
      return this.scripts[name];
    }
  }, {
    key: 'resolveDependency',
    value: function resolveDependency(dependency, graph) {
      var _this = this;

      return this.scriptifyBlock(dependency).then(function (_ref2) {
        var dependencies = _ref2.dependencies;
        return _this.PromiseRef.all(dependencies.map(function (dep) {
          if (graph.nodes().indexOf(dep) < 0) {
            return _this.resolveDependency(dep, graph);
          }
          graph.addEdge(dep, dependency);
          return null;
        }));
      });
    }
  }, {
    key: 'localizeDependency',
    value: function localizeDependency(name) {
      if (!this.scripts[name]) {
        throw new Error(name + ' has not been properly resolved');
      }
      return this.scripts[name].then(function (_ref3) {
        var script = _ref3.script;
        return JSON.stringify(name) + ': (function () {\n          function Component(props) {\n            return ' + script + ';\n          }\n          Component.displayName = ' + JSON.stringify(name) + ';\n          return Component;\n        })()';
      });
    }
  }, {
    key: 'assemble',
    value: function assemble(script, graph) {
      var _this2 = this;

      var name = arguments.length <= 2 || arguments[2] === undefined ? 'Component' : arguments[2];

      return this.PromiseRef.all(graph.topologicalSort().map(function (dep) {
        return _this2.localizeDependency(dep);
      })).then(function (deps) {
        return deps.join(',\n');
      }).then(function (dependencies) {
        return '(function (React, components) {\n        var locals = {\n          ' + dependencies + '\n        };\n        function Component(props) {\n          return ' + script + ';\n        }\n        Component.displayName = ' + JSON.stringify(name) + ';\n        return Component;\n      })';
      });
    }
  }, {
    key: 'compile',
    value: function compile(entry, name) {
      var _this3 = this;

      var graph = new _graphDataStructure2.default();
      return this.scriptify(entry, true).then(function (_ref4) {
        var script = _ref4.script;
        var dependencies = _ref4.dependencies;
        return _this3.PromiseRef.all(dependencies.map(function (dep) {
          graph.addNode(dep);
          return _this3.resolveDependency(dep, graph);
        })).then(function () {
          return script;
        });
      }).then(function (script) {
        return _this3.assemble(script, graph, name);
      });
    }
  }]);

  return Loader;
}();

exports.default = Loader;