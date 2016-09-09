'use strict';

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _loader = require('../loader');

var _loader2 = _interopRequireDefault(_loader);

var _factory = require('../factory');

var _factory2 = _interopRequireDefault(_factory);

var _data = require('../../test-data/data.json');

var _data2 = _interopRequireDefault(_data);

var _result = require('../../test-data/result.json');

var _result2 = _interopRequireDefault(_result);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function evalComponent(script) {
  var components = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var foo = new Function('factory', 'components', 'props', 'return ' + script + '(factory, components, props)'); // eslint-disable-line
  return foo(_factory2.default, components, {
    testData: _data2.default
  });
}

describe('Loader', function () {
  var entry = {
    type: 'div',
    props: {
      children: [{
        type: 'MyForthBlock'
      }, {
        type: 'MyThirdBlock'
      }, {
        type: 'MyBlock',
        props: {
          children: 'Top level block'
        }
      }]
    }
  };
  var MyBlock = {
    type: 'p',
    evalProps: {
      children: 'props.children'
    }
  };
  var MyThirdBlock = {
    type: 'header',
    props: {
      children: 'My third block'
    }
  };
  var MyForthBlock = {
    type: 'section',
    props: {
      children: [{
        type: 'MyThirdBlock'
      }, {
        type: 'MyBlock',
        props: {
          children: 'Mid level block'
        }
      }]
    }
  };
  it('should produce something', function (done) {
    var loader = new _loader2.default({
      blocks: {
        MyBlock: MyBlock,
        MyThirdBlock: MyThirdBlock,
        MyForthBlock: MyForthBlock
      }
    });
    return loader.compile(entry).then(function (t) {
      var body = evalComponent(t);
      var html = _server2.default.renderToStaticMarkup(body);
      expect(html).toEqual('<div><section><header>My third block</header><p>Mid level block</p></section><header>My third block</header><p>Top level block</p></div>'); // eslint-disable-line
    }).then(done);
  });
  it('should map scripts', function (done) {
    var loader = new _loader2.default({
      scriptMapper: function scriptMapper() {
        return Promise.resolve({
          type: 'p',
          props: {
            children: 'This block is overriden'
          }
        });
      }
    });
    return loader.compile(entry).then(function (t) {
      var body = evalComponent(t);
      var html = _server2.default.renderToStaticMarkup(body);
      expect(html).toEqual('<p>This block is overriden</p>'); // eslint-disable-line
    }).then(done);
  });
});

describe('Heavy load', function () {
  var MyComponent = {
    type: 'p',
    evalProps: {
      children: 'props.testData.map(function (t) { return t[props.dataKey] })'
    }
  };
  var entry = {
    type: 'div',
    props: {
      children: [{
        type: 'MyComponent',
        evalProps: {
          testData: 'props.testData'
        },
        props: {
          dataKey: 'company'
        }
      }, {
        type: 'MyComponent',
        evalProps: {
          testData: 'props.testData'
        },
        props: {
          dataKey: 'email'
        }
      }, {
        type: 'MyComponent',
        evalProps: {
          testData: 'props.testData'
        },
        props: {
          dataKey: 'phone'
        }
      }]
    }
  };
  it('should produce something with heavy load', function (done) {
    var loader = new _loader2.default({
      blocks: {
        MyComponent: MyComponent
      }
    });
    var tm1 = Date.now();
    return loader.compile(entry, 'Big').then(function (t) {
      var t0 = Date.now();
      var body = evalComponent(t);
      var t1 = Date.now();
      var html = _server2.default.renderToStaticMarkup(body);
      var t2 = Date.now();
      console.log('Compile', t0 - tm1, 'ms');
      console.log('Eval', t1 - t0, 'ms');
      console.log('Render', t2 - t1, 'ms');
      expect(html).toEqual(_result2.default.str);
    }).then(done);
  });
});