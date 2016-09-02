'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.autoMockOff();

var React = require('react');
var reactifier = require('../index').reactifier;
var render = require('enzyme').render;
var shallow = require('enzyme').shallow;
var ReactDOM = require('react-dom/server');

function composeEval(str, key) {
  var fn = function fn(props) {
    try {
      return new Function('with(this) { return ' + str + ' }').call(props);
    } catch (e) {
      console.log('Could not eval ' + str, params);
      return undefined;
    }
  };
  return function (props) {
    return _defineProperty({}, key, fn(props));
  };
}

function Map(_ref2) {
  var Wrapper = _ref2.Wrapper;
  var items = _ref2.items;
  var children = _ref2.children;

  var element = React.Children.only(children);
  return React.createElement(
    Wrapper,
    null,
    items.map(function (item, key) {
      return React.cloneElement(element, _extends({
        key: key
      }, item));
    })
  );
}

var reactify = reactifier({
  Map: Map
}, {
  injectors: {
    compose: composeEval
  }
});

describe('Reactify', function () {
  it('should render something', function () {
    var component = reactify({
      type: 'div',
      props: {
        children: 'Hello world'
      }
    });
    var a = shallow(component);
    var b = shallow(React.createElement(
      'div',
      null,
      'Hello world'
    ));
    expect(a.text()).toEqual(b.text());
  });
  it('should compose props', function () {
    var component = reactify({
      type: 'div',
      props: {
        children: 'COMPOSE label + "label"'
      }
    });
    var a = ReactDOM.renderToStaticMarkup(React.cloneElement(component, { label: 'my ' }));
    var b = ReactDOM.renderToStaticMarkup(React.createElement(
      'div',
      { label: 'my ' },
      'my label'
    ));
    expect(a).toEqual(b);
  });
  it('should render nested components', function () {
    var component = reactify({
      type: 'div',
      props: {
        children: [{
          type: 'p',
          props: {
            children: 'I am a paragraf'
          }
        }, {
          type: 'h1',
          props: {
            children: 'I am a header'
          }
        }, {
          type: 'div',
          props: {
            children: [{
              type: 'div',
              props: {
                style: {
                  backgroundColor: 'blue'
                },
                children: 'More'
              }
            }, {
              type: 'div',
              props: {
                style: {
                  backgroundColor: 'red'
                },
                children: 'Less'
              }
            }]
          }
        }]
      }
    });
    var a = ReactDOM.renderToStaticMarkup(component);
    var b = ReactDOM.renderToStaticMarkup(React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'I am a paragraf'
      ),
      React.createElement(
        'h1',
        null,
        'I am a header'
      ),
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { style: { backgroundColor: 'blue' } },
          'More'
        ),
        React.createElement(
          'div',
          { style: { backgroundColor: 'red' } },
          'Less'
        )
      )
    ));
    expect(a).toEqual(b);
  });
  it('should render mapped items', function () {
    var component = reactify({
      type: 'Map',
      props: {
        Wrapper: 'section',
        items: [{
          label: 'First'
        }, {
          label: 'Second'
        }, {
          label: 'Third'
        }],
        children: {
          type: 'p',
          props: {
            children: 'COMPOSE label'
          }
        }
      }
    });
    var a = ReactDOM.renderToStaticMarkup(component);
    var b = ReactDOM.renderToStaticMarkup(React.createElement(
      'section',
      null,
      React.createElement(
        'p',
        { label: 'First' },
        'First'
      ),
      React.createElement(
        'p',
        { label: 'Second' },
        'Second'
      ),
      React.createElement(
        'p',
        { label: 'Third' },
        'Third'
      )
    ));
    expect(a).toEqual(b);
  });
});