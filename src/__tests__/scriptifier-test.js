import { scriptifier } from '../index';
import React from 'react';
import ReactDOM from 'react-dom/server';

describe('Scriptifier', () => {
  const scriptify = scriptifier({});
  it('should produce something', () => {
    const to = scriptify({
      type: 'div',
      props: {
        children: 'test',
      },
    });
    const res = ReactDOM.renderToStaticMarkup(to.call({
      React,
    }));
    expect(res).toEqual('<div>test</div>');
  });
});
