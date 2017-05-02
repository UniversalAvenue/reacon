'use strict';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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
  children: _propTypes2.default.element.isRequired
};

var uftLetters = require('./utf-stuff.json').str;

var Display = function Display(props) {
  return _react2.default.createElement('p', {
    dangerouslySetInnerHTML: { __html: JSON.stringify(props, null, '  ') }
  });
};

var components = {
  MyP: MyP,
  Display: Display
};
describe('Scriptifier', function () {
  var scriptifier = new _scriptifier2.default({
    globals: Object.keys(components)
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
            children: 'a string'
          }
        }
      }
    });
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, null));
    expect(res).toEqual('<div><p style="z-index:12;">a string</p></div>');
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
    var Component = scriptifier.reactify(content, components);
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
    var Component = scriptifier.reactify(content, components);
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, { className: 'olle', role: 'button' }));
    expect(res).toEqual('<div class="olle"><p role="button">my Hola</p></div>');
  });
  it('should use exposed nested props', function () {
    var content = {
      type: 'div',
      evalProps: {
        style: {
          background: 'props.background'
        }
      },
      props: {
        style: {
          color: 'blue'
        },
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
    var Component = scriptifier.reactify(content, components);
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, { background: 'black', role: 'button' }));
    expect(res).toEqual('<div style="color:blue;background:black;"><p role="button">my Hola</p></div>'); // eslint-disable-line
  });
  it('should kill \u2028 and \u2029', function () {
    var Component = scriptifier.reactify({
      type: 'div',
      props: {
        children: {
          type: 'p',
          props: {
            style: {
              zIndex: 12
            },
            children: 'This (' + uftLetters + ') is nothing'
          }
        }
      }
    });
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, null));
    expect(res).toEqual('<div><p style="z-index:12;">This () is nothing</p></div>');
  });
  it('should eval complex types', function () {
    var content = {
      type: 'Display',
      evalProps: {
        iconList: {
          items: ['"firstItem"', 'props.label', 5]
        }
      }
    };
    var Component = scriptifier.reactify(content, components);
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, { label: 'daniel' }));
    expect(res).toEqual(['<p>', JSON.stringify({
      iconList: {
        items: ['firstItem', 'daniel', 5]
      }
    }, null, '  '), '</p>'].join(''));
  });
  it('should allow nested rendered components', function () {
    var content = {
      type: 'div',
      defaultProps: {
        children: {
          type: 'p',
          props: {
            children: 'Default message'
          }
        }
      },
      props: {
        children: {
          type: 'p',
          props: {
            children: 'Hola'
          }
        }
      }
    };
    var Component = scriptifier.reactify(content, components);
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(Component, null));
    expect(res).toEqual('<div><p>Hola</p></div>'); // eslint-disable-line
  });
  it('should allow injected rendered components', function () {
    var content = {
      type: 'div',
      defaultProps: {
        children: {
          type: 'p',
          props: {
            children: 'Default message'
          }
        }
      },
      props: {
        children: {
          type: 'p',
          spread: true
        }
      }
    };
    var Component = scriptifier.reactify(content, components);
    var res = _server2.default.renderToStaticMarkup(_react2.default.createElement(
      Component,
      null,
      'Hello override'
    ));
    expect(res).toEqual('<div><p>Hello override</p></div>'); // eslint-disable-line
  });
});