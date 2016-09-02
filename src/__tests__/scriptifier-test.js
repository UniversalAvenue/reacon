import { scriptifier } from '../index';
import React from 'react';
import ReactDOM from 'react-dom/server';

describe('Scriptifier', () => {
  const scriptify = scriptifier({});
  it('should produce something', () => {
    const Component = scriptify({
      type: 'div',
      props: {
        children: {
          type: 'p',
          props: {
            children: 'Hola',
          },
        },
      },
    });
    const res = ReactDOM.renderToStaticMarkup(<Component />);
    expect(res).toEqual('<div><p>Hola</p></div>');
  });
});
