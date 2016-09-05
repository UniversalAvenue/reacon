'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _loader = require('../loader');

var _loader2 = _interopRequireDefault(_loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function evalComponent(script) {
  var components = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var foo = new Function('React', 'components', 'return ' + script + '(React, components)'); // eslint-disable-line
  return foo(_react2.default, components);
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
  it('should produce something', function () {
    var loader = new _loader2.default({
      blocks: {
        MyBlock: MyBlock,
        MyThirdBlock: MyThirdBlock,
        MyForthBlock: MyForthBlock
      }
    });
    var t = loader.compile(entry);
    var Comp = evalComponent(t);
    var html = _server2.default.renderToStaticMarkup(_react2.default.createElement(Comp, null));
    expect(html).toEqual('<div><section><header>My third block</header><p>Mid level block</p></section><header>My third block</header><p>Top level block</p></div>'); // eslint-disable-line
  });
});