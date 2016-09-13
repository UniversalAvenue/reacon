import Graph from 'graph-data-structure';
import Scriptifier from './scriptifier';

export default class Loader {
  constructor({
    blocks = {},
    PromiseRef = Promise,
    scriptMapper = content => Promise.resolve(content),
    entryMapper,
    mapContext = {},
    mapArgs = [],
    globals = [],
  } = {}) {
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
  mapScript(content, isEntry) {
    const mapper = isEntry ? this.entryMapper : this.scriptMapper;
    return mapper.apply(this.mapContext, [content, ...this.mapArgs]);
  }
  scriptify(content, isEntry) {
    const scriptifier = new Scriptifier({
      globals: this.globals,
      locals: this.locals,
    });
    return this.mapScript(content, isEntry)
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
                graph.addEdge(dep, dependency);
                return this.resolveDependency(dep, graph);
              }
              graph.addEdge(dep, dependency);
              return null;
            })
        )
      );
  }
  compileDependency(script, name) {
    if (process.env.NODE_ENV === 'production') {
      return `(function (props) {
        return ${script};
      })`;
    }
    return `(function () {
      function Component(props) {
        return ${script};
      }
      Component.displayName = ${JSON.stringify(name)};
      return Component;
    })()`;
  }
  localizeDependency(name) {
    if (!this.scripts[name]) {
      throw new Error(`${name} has not been properly resolved`);
    }
    return this.scripts[name]
      .then(({ script }) =>
        `${JSON.stringify(name)}: ${this.compileDependency(script, name)}`);
  }
  assemble(script, graph) {
    return this.PromiseRef.all(graph.topologicalSort()
      .map(dep => this.localizeDependency(dep)))
      .then(deps => deps.join(',\n'))
      .then(dependencies => `(function (factory, components, props) {
        var locals = {
          ${dependencies}
        };
        return ${script};
      })`);
  }
  compile(entry) {
    const graph = new Graph();
    return this.scriptify(entry, true)
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
      ).then(script => this.assemble(script, graph));
  }
}
