import React from 'react';
import ReactDOM from 'react-dom/server';

import { scriptifier, reactifier } from '../src/index';
import * as components from './components';

const title = 'Hello reacon';
const tagline = 'This is the tagline';
const body = 'This is the body and it is huge';
const button = 'Click this button';

const iterations = 10000;
const bodies = Array(1).fill().map((_, i) => i);

const reaconContent = {
  type: 'section',
  props: {
    children: [
      {
        type: 'Title',
        props: {
          children: title,
        },
      },
      {
        type: 'Tagline',
        props: {
          children: tagline,
        },
      },
      {
        type: 'Button',
        props: {
          children: button,
        },
      },
      ...bodies.map(i => ({
        type: 'Body',
        props: {
          key: i,
          children: body,
        },
      })),
    ],
  },
};

const scriptify = scriptifier(components);
const reactify = reactifier(components);

function renderReacon() {
  const Component = scriptify(reaconContent);
  return <Component />;
}

function renderSlowReacon() {
  return reactify(reaconContent);
}

function renderStraight() {
  const Title = components.Title;
  const Tagline = components.Tagline;
  const Body = components.Body;
  const Button = components.Button;
  return (<section>
    <Title>{title}</Title>
    <Tagline>{tagline}</Tagline>
    <Button>{button}</Button>
    {bodies.map((key) => <Body key={key}>{body}</Body>)}
  </section>);
}

function measure(foo, str) {
  function getNow() {
    return Date.now();
  }
  const t0 = getNow();
  const res = foo();
  const t1 = getNow();
  console.log(str, ':', t1 - t0, 'ms');
  return res;
}

function loop(ln, foo) {
  return () => {
    let i = 0;
    while (i < ln) {
      foo();
      i++;
    }
  };
}

measure(loop(iterations, renderReacon), 'Scriptify');
measure(loop(iterations, renderSlowReacon), 'Reactify');
measure(loop(iterations, renderStraight), 'Standard');

// console.log(ReactDOM.renderToStaticMarkup(renderReacon()));
// console.log(ReactDOM.renderToStaticMarkup(renderStraight()));
console.log(
  'Scriptify is equal to Standard?',
  ReactDOM.renderToStaticMarkup(renderReacon()) ===
  ReactDOM.renderToStaticMarkup(renderStraight())
);
console.log(
  'Scriptify is equal to Reactify?',
  ReactDOM.renderToStaticMarkup(renderReacon()) ===
  ReactDOM.renderToStaticMarkup(renderSlowReacon())
);
