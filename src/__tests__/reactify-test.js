const React = require('react');
const reactifier = require('../index').reactifier;
const shallow = require('enzyme').shallow;
const ReactDOM = require('react-dom/server');

const reactify = reactifier({
});

describe('Reactify', () => {
  it('should render something', () => {
    const component = reactify({
      type: 'div',
      props: {
        children: 'Hello world',
      },
    });
    const a = shallow(component);
    const b = shallow(<div>Hello world</div>);
    expect(a.text()).toEqual(b.text());
  });
  it('should render nested components', () => {
    const component = reactify({
      type: 'div',
      props: {
        children: [
          {
            type: 'p',
            props: {
              children: 'I am a paragraf',
            },
          },
          {
            type: 'h1',
            props: {
              children: 'I am a header',
            },
          },
          {
            type: 'div',
            props: {
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      backgroundColor: 'blue',
                    },
                    children: 'More',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      backgroundColor: 'red',
                    },
                    children: 'Less',
                  },
                },
              ],
            },
          },
        ],
      },
    });
    const a = ReactDOM.renderToStaticMarkup(component);
    const b = ReactDOM.renderToStaticMarkup(<div>
      <p>I am a paragraf</p>
      <h1>I am a header</h1>
      <div>
        <div style={{ backgroundColor: 'blue' }}>More</div>
        <div style={{ backgroundColor: 'red' }}>Less</div>
      </div>
    </div>);
    expect(a).toEqual(b);
  });
});
