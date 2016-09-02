import { scriptifier, reactifier } from '../index';
import React from 'react';
import ReactDOM from 'react-dom/server';

describe('Scriptifier', () => {
  const scriptify = scriptifier({});
  const reactify = reactifier({});
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
  it('should be equal to reactify approach', () => {
    const content = {
      type: 'div',
      props: {
        children: {
          type: 'p',
          props: {
            children: 'Hola',
          },
        },
      },
    };
    const Component = scriptify(content);
    const a = ReactDOM.renderToStaticMarkup(<Component />);
    const b = ReactDOM.renderToStaticMarkup(reactify(content));
    expect(a).toEqual(b);
  });
});
