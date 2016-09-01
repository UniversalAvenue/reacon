jest.autoMockOff();

const React = require('react');
const reactifier = require('../index').reactifier;

const reactify = reactifier({});

describe('Reactify', () => {
  it('should render something', () => {
    const t = reactify({
      type: 'div',
      props: {
        Component: {
          type: 'a',
        },
        children: 'Hello world',
      },
    });
    expect(t).toEqual(<div Component={<a />}>Hello world</div>);
  });
});
