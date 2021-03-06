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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Loader = function () {
  function Loader() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$blocks = _ref.blocks,
        blocks = _ref$blocks === undefined ? {} : _ref$blocks,
        _ref$PromiseRef = _ref.PromiseRef,
        PromiseRef = _ref$PromiseRef === undefined ? Promise : _ref$PromiseRef,
        _ref$scriptMapper = _ref.scriptMapper,
        scriptMapper = _ref$scriptMapper === undefined ? function (content) {
      return Promise.resolve(content);
    } : _ref$scriptMapper,
        entryMapper = _ref.entryMapper,
        _ref$mapContext = _ref.mapContext,
        mapContext = _ref$mapContext === undefined ? {} : _ref$mapContext,
        _ref$mapArgs = _ref.mapArgs,
        mapArgs = _ref$mapArgs === undefined ? [] : _ref$mapArgs,
        _ref$globals = _ref.globals,
        globals = _ref$globals === undefined ? [] : _ref$globals;

    _classCallCheck(this, Loader);

    this.blocks = blocks;
    this.scripts = {};
    this.PromiseRef = PromiseRef;
    this.scriptMapper = scriptMapper;
    this.entryMapper = entryMapper || scriptMapper;
    this.mapContext = mapContext;
    this.mapArgs = mapArgs;
    this.locals = new Set(Object.keys(blocks));
    this.globals = new Set(globals);
  }

  _createClass(Loader, [{
    key: 'mapScript',
    value: function mapScript(content, isEntry) {
      var mapper = isEntry ? this.entryMapper : this.scriptMapper;
      return mapper.apply(this.mapContext, [content].concat(_toConsumableArray(this.mapArgs)));
    }
  }, {
    key: 'scriptify',
    value: function scriptify(content, isEntry) {
      var scriptifier = new _scriptifier2.default({
        globals: this.globals,
        locals: this.locals
      });
      return this.mapScript(content, isEntry).then(function (c) {
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
            graph.addEdge(dep, dependency);
            return _this.resolveDependency(dep, graph);
          }
          graph.addEdge(dep, dependency);
          return null;
        }));
      });
    }
    // eslint-disable-next-line

  }, {
    key: 'compileDependency',
    value: function compileDependency(script, name) {
      if (process.env.NODE_ENV === 'production') {
        return '(function (props) {\n        return ' + script + ';\n      })';
      }
      return '(function () {\n      function Component(props) {\n        return ' + script + ';\n      }\n      Component.displayName = ' + JSON.stringify(name) + ';\n      return Component;\n    })()';
    }
  }, {
    key: 'localizeDependency',
    value: function localizeDependency(name) {
      var _this2 = this;

      if (!this.scripts[name]) {
        throw new Error(name + ' has not been properly resolved');
      }
      return this.scripts[name].then(function (_ref3) {
        var script = _ref3.script;
        return JSON.stringify(name) + ': ' + _this2.compileDependency(script, name);
      });
    }
  }, {
    key: 'assemble',
    value: function assemble(script, graph) {
      var _this3 = this;

      return this.PromiseRef.all(graph.topologicalSort().map(function (dep) {
        return _this3.localizeDependency(dep);
      })).then(function (deps) {
        return deps.join(',\n');
      }).then(function (dependencies) {
        return '(function (factory, components, props) {\n        var locals = {\n          ' + dependencies + '\n        };\n        return ' + script + ';\n      })';
      });
    }
  }, {
    key: 'compile',
    value: function compile(entry) {
      var _this4 = this;

      var graph = new _graphDataStructure2.default();
      return this.scriptify(entry, true).then(function (_ref4) {
        var script = _ref4.script,
            dependencies = _ref4.dependencies;
        return _this4.PromiseRef.all(dependencies.map(function (dep) {
          graph.addNode(dep);
          return _this4.resolveDependency(dep, graph);
        })).then(function () {
          return script;
        });
      }).then(function (script) {
        return _this4.assemble(script, graph);
      });
    }
  }]);

  return Loader;
}();

exports.default = Loader;