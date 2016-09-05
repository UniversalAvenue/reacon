'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _index = require('../index');

var _scriptifier = require('../scriptifier');

var _scriptifier2 = _interopRequireDefault(_scriptifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MyP = function MyP(props) {
  return _react2.default.createElement(
    'p',
    props,
    'my ',
    props.children
  );
};
MyP.propTypes = {
  children: _react2.default.PropTypes.any
};

describe('Scriptifier', function () {
  var scriptifier = new _scriptifier2.default({
    MyP: MyP
  });
  var reactify = (0, _index.reactifier)({});
  it('should produce something', function () {
    var Component = scriptifier.reactify({
      type: 'div',
      props: {
        children: {
          type: 'p',
          props: {
            style: {
              zIndex: 12
            },
            children: 'Hola'
          }
        }
      }
    });
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, null));
    expect(res).toEqual('<div><p style="z-index:12;">Hola</p></div>');
  });
  it('should be equal to reactify approach', function () {
    var content = {
      type: 'div',
      props: {
        children: {
          type: 'p',
          props: {
            children: 'Hola'
          }
        }
      }
    };
    var Component = scriptifier.reactify(content);
    var a = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, null));
    var b = _server2.default.renderToStaticMarkup(reactify(content));
    expect(a).toEqual(b);
  });
  it('should use exposed props', function () {
    var content = {
      type: 'div',
      evalProps: {
        className: 'props.className'
      },
      props: {
        children: {
          type: 'MyP',
          evalProps: {
            role: 'props.role'
          },
          props: {
            children: 'Hola'
          }
        }
      }
    };
    var Component = scriptifier.reactify(content);
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, { className: 'olle', role: 'button' }));
    expect(res).toEqual('<div class="olle"><p role="button">my Hola</p></div>');
  });
});