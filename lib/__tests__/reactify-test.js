'use strict';

var React = require('react');
var reactifier = require('../index').reactifier;
var shallow = require('enzyme').shallow;
var ReactDOM = require('react-dom/server');

var reactify = reactifier({});

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
});