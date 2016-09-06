import React from 'react';
import ReactDOM from 'react-dom/server';
import Loader from '../loader';

function evalComponent(script, components = {}) {
  const foo = new Function('React', 'components', `return ${script}(React, components)`); // eslint-disable-line
  return foo(React, components);
}

describe('Loader', () => {
  const entry = {
    type: 'div',
    props: {
      children: [
        {
          type: 'MyForthBlock',
        },
        {
          type: 'MyThirdBlock',
        },
        {
          type: 'MyBlock',
          props: {
            children: 'Top level block',
          },
        },
      ],
    },
  };
  const MyBlock = {
    type: 'p',
    evalProps: {
      children: 'props.children',
    },
  };
  const MyThirdBlock = {
    type: 'header',
    props: {
      children: 'My third block',
    },
  };
  const MyForthBlock = {
    type: 'section',
    props: {
      children: [
        {
          type: 'MyThirdBlock',
        },
        {
          type: 'MyBlock',
          props: {
            children: 'Mid level block',
          },
        },
      ],
    },
  };
  it('should produce something', (done) => {
    const loader = new Loader({
      blocks: {
        MyBlock,
        MyThirdBlock,
        MyForthBlock,
      },
    });
    return loader.compile(entry)
      .then(t => {
        const Comp = evalComponent(t);
        const html = ReactDOM.renderToStaticMarkup(<Comp />);
        expect(html).toEqual('<div><section><header>My third block</header><p>Mid level block</p></section><header>My third block</header><p>Top level block</p></div>'); // eslint-disable-line
      }).then(done);
  });
  it('should map scripts', (done) => {
    const loader = new Loader({
      scriptMapper: () => Promise.resolve({
        type: 'p',
        props: {
          children: 'This block is overriden',
        },
      }),
    });
    return loader.compile(entry)
      .then(t => {
        const Comp = evalComponent(t);
        const html = ReactDOM.renderToStaticMarkup(<Comp />);
        expect(html).toEqual('<p>This block is overriden</p>'); // eslint-disable-line
      }).then(done);
  });
});
