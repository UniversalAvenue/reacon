'use strict';

var _index = require('../index');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Scriptifier', function () {
  var scriptify = (0, _index.scriptifier)({});
  var reactify = (0, _index.reactifier)({});
  it('should produce something', function () {
    var Component = scriptify({
      type: 'div',
      props: {
        children: {
          type: 'p',
          props: {
            children: 'Hola'
          }
        }
      }
    });
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, null));
    expect(res).toEqual('<div><p>Hola</p></div>');
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
    var Component = scriptify(content);
    var a = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, null));
    var b = _server2.default.renderToStaticMarkup(reactify(content));
    expect(a).toEqual(b);
  });
});