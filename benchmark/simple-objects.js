import React from 'react';
import ReactDOM from 'react-dom/server';

import { reactifier } from '../src/index';
import * as components from './components';

const title = 'Hello reacon';
const tagline = 'This is the tagline';
const body = 'This is the body and it is huge';
const button = 'Click this button';

const iterations = 1;
const bodies = Array(1000).fill().map((_, i) => i);

const reaconContent = {
  type: 'div',
  props: {
    children: [
      {
        type: 'Title',
        props: {
          children: 'COMPOSE title',
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

const reactify = reactifier(components);


function renderReacon() {
  return reactify(reaconContent);
}

function renderStraight() {
  const Content = components.Content;
  const Body = components.Body;
  return (<Content
    title={title}
    tagline={tagline}
    button={button}
  >
    {bodies.map((key) => <Body key={key}>{body}</Body>)}
  </Content>);
}

function measure(foo) {
  function getNow() {
    return Date.now();
  }
  const t0 = getNow();
  const res = foo();
  const t1 = getNow();
  console.log('Time was', t1 - t0, 'ms');
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

measure(loop(iterations, renderReacon));
measure(loop(iterations, renderStraight));
