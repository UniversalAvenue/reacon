import { reactifier } from '../index';
import Scriptifier from '../scriptifier';
import React from 'react';
import ReactDOM from 'react-dom/server';

describe('Scriptifier', () => {
  const scriptifier = new Scriptifier({});
  const reactify = reactifier({});
  it('should produce something', () => {
    const Component = scriptifier.reactify({
      type: 'div',
      props: {
        children: {
          type: 'p',
          props: {
            style: {
              zIndex: 12,
            },
            children: 'Hola',
          },
        },
      },
    });
    const res = ReactDOM.renderToStaticMarkup(<Component />);
    expect(res).toEqual('<div><p style="z-index:12;">Hola</p></div>');
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
    const Component = scriptifier.reactify(content);
    const a = ReactDOM.renderToStaticMarkup(<Component />);
    const b = ReactDOM.renderToStaticMarkup(reactify(content));
    expect(a).toEqual(b);
  });
  it('should use exposed props', () => {
    const content = {
      type: 'div',
      evalProps: {
        className: 'props.className',
      },
      props: {
        children: {
          type: 'p',
          evalProps: {
            role: 'props.role',
          },
          props: {
            children: 'Hola',
          },
        },
      },
    };
    const Component = scriptifier.reactify(content);
    const res = ReactDOM.renderToStaticMarkup(<Component className="olle" role="greeter" />);
    expect(res).toEqual('<div class="olle"><p role="greeter">Hola</p></div>');
  });
});
