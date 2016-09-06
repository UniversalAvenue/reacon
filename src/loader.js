import Graph from 'graph-data-structure';
import Scriptifier from './scriptifier';

export default class Loader {
  constructor({
    blocks = {},
    PromiseRef = Promise,
    scriptMapper = content => Promise.resolve(content),
  } = {}) {
    this.blocks = blocks;
    this.scripts = {};
    this.PromiseRef = PromiseRef;
    this.scriptMapper = scriptMapper;
  }
  scriptify(content) {
    const scriptifier = new Scriptifier({
      locals: new Set(Object.keys(this.blocks)),
    });
    return this.scriptMapper(content)
      .then(c => scriptifier.scriptify(c))
      .then(script => ({
        script,
        dependencies: Array.from(scriptifier.dependencies),
      }));
  }
  scriptifyBlock(name) {
    if (!this.scripts[name]) {
      this.scripts[name] = this.scriptify(this.blocks[name]);
    }
    return this.scripts[name];
  }
  resolveDependency(dependency, graph) {
    return this.scriptifyBlock(dependency)
      .then(({ dependencies }) =>
        this.PromiseRef.all(
          dependencies
            .map(dep => {
              if (graph.nodes().indexOf(dep) < 0) {
                return this.resolveDependency(dep, graph);
              }
              graph.addEdge(dep, dependency);
              return null;
            })
        )
      );
  }
  localizeDependency(name) {
    if (!this.scripts[name]) {
      throw new Error(`${name} has not been properly resolved`);
    }
    return this.scripts[name]
      .then(({ script }) =>
        `${JSON.stringify(name)}: (function () {
          function Component(props) {
            return ${script};
          }
          Component.displayName = ${JSON.stringify(name)};
          return Component;
        })()`);
  }
  assemble(script, graph, name = 'Component') {
    return this.PromiseRef.all(graph.topologicalSort()
      .map(dep => this.localizeDependency(dep)))
      .then(deps => deps.join(',\n'))
      .then(dependencies => `(function (React, components) {
        var locals = {
          ${dependencies}
        };
        function Component(props) {
          return ${script};
        }
        Component.displayName = ${JSON.stringify(name)};
        return Component;
      })`);
  }
  compile(entry, name) {
    const graph = new Graph();
    return this.scriptify(entry)
      .then(({
        script,
        dependencies,
      }) =>
        this.PromiseRef.all(
          dependencies
            .map(dep => {
              graph.addNode(dep);
              return this.resolveDependency(dep, graph);
            })
        ).then(() => script)
      ).then(script => this.assemble(script, graph, name));
  }
}
