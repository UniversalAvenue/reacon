import React from 'react';
import ReactDOM from 'react-dom/server';
import { reactifier } from '../index';
import Scriptifier from '../scriptifier';

const MyP = props => <p {...props}>my {props.children}</p>;
MyP.propTypes = {
  children: React.PropTypes.any,
};

const components = {
  MyP,
};
describe('Scriptifier', () => {
  const scriptifier = new Scriptifier({
    globals: Object.keys(components),
  });
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
    const Component = scriptifier.reactify(content, components);
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
          type: 'MyP',
          evalProps: {
            role: 'props.role',
          },
          props: {
            children: 'Hola',
          },
        },
      },
    };
    const Component = scriptifier.reactify(content, components);
    const res = ReactDOM.renderToStaticMarkup(<Component className="olle" role="button" />);
    expect(res).toEqual('<div class="olle"><p role="button">my Hola</p></div>');
  });
  it('should use exposed nested props', () => {
    const content = {
      type: 'div',
      evalProps: {
        style: {
          background: 'props.background',
        },
      },
      props: {
        style: {
          color: 'blue',
        },
        children: {
          type: 'MyP',
          evalProps: {
            role: 'props.role',
          },
          props: {
            children: 'Hola',
          },
        },
      },
    };
    const Component = scriptifier.reactify(content, components);
    const res = ReactDOM.renderToStaticMarkup(<Component background="black" role="button" />);
    expect(res).toEqual('<div style="color:blue;background:black;"><p role="button">my Hola</p></div>'); // eslint-disable-line
  });
});
