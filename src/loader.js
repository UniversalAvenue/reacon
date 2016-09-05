import Graph from 'graph-data-structure';
import Scriptifier from './scriptifier';

export default class Loader {
  constructor({
    blocks = {},
  } = {}) {
    this.blocks = blocks;
    this.scripts = {};
  }
  scriptify(content) {
    const scriptifier = new Scriptifier({
      locals: new Set(Object.keys(this.blocks)),
    });
    const script = scriptifier.scriptify(content);
    return {
      script,
      dependencies: Array.from(scriptifier.dependencies),
    };
  }
  scriptifyBlock(name) {
    if (!this.scripts[name]) {
      this.scripts[name] = this.scriptify(this.blocks[name]);
    }
    return this.scripts[name];
  }
  resolveDependency(dependency, graph) {
    const {
      dependencies,
    } = this.scriptifyBlock(dependency);
    dependencies
      .forEach(dep => {
        if (graph.nodes().indexOf(dep) < 0) {
          this.resolveDependency(dep, graph);
        }
        graph.addEdge(dep, dependency);
      });
  }
  localizeDependency(name) {
    if (!this.scripts[name]) {
      throw new Error(`${name} has not been properly resolved`);
    }
    const {
      script,
    } = this.scripts[name];
    return `${JSON.stringify(name)}: (function () {
      function Component(props) {
        return ${script};
      }
      Component.displayName = ${JSON.stringify(name)};
      return Component;
    })()`;
  }
  assemble(script, graph, name = 'Component') {
    const dependencies = graph.topologicalSort()
      .map(dep => this.localizeDependency(dep))
      .join(',\n');
    return `(function (React, components) {
      var locals = {
        ${dependencies}
      };
      function Component(props) {
        return ${script};
      }
      Component.displayName = ${JSON.stringify(name)};
      return Component;
    })(React, components)`;
  }
  compile(entry, name) {
    const graph = new Graph();
    const {
      script,
      dependencies,
    } = this.scriptify(entry);
    dependencies
      .forEach(dep => {
        graph.addNode(dep);
        this.resolveDependency(dep, graph);
      });
    return this.assemble(script, graph, name);
  }
}
