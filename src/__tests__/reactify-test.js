jest.autoMockOff();

const React = require('react');
const reactifier = require('../index').reactifier;
const render = require('enzyme').render;
const shallow = require('enzyme').shallow;
const ReactDOM = require('react-dom/server');

function composeEval(str, key) {
  const fn = props => {
    try {
      return (new Function(`with(this) { return ${str} }`)).call(props);
    } catch (e) {
      console.log(`Could not eval ${str}`, params);
      return undefined;
    }
  };
  return props => ({
    [key]: fn(props),
  });
}

function Map({
  Wrapper,
  items,
  children,
}) {
  const element = React.Children.only(children);
  return (<Wrapper>
    {items.map((item, key) =>
      React.cloneElement(element, {
        key,
        ...item,
      }))}
  </Wrapper>);
}

const reactify = reactifier({
  Map,
}, {
  injectors: {
    compose: composeEval,
  },
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
  it('should compose props', () => {
    const component = reactify({
      type: 'div',
      props: {
        children: 'COMPOSE label + "label"',
      },
    });
    const a = ReactDOM.renderToStaticMarkup(React.cloneElement(component, { label: 'my ' }));
    const b = ReactDOM.renderToStaticMarkup(<div label="my ">my label</div>);
    expect(a).toEqual(b);
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
  it('should render mapped items', () => {
    const component = reactify({
      type: 'Map',
      props: {
        Wrapper: 'section',
        items: [
          {
            label: 'First',
          },
          {
            label: 'Second',
          },
          {
            label: 'Third',
          },
        ],
        children: {
          type: 'p',
          props: {
            children: 'COMPOSE label',
          },
        },
      },
    });
    const a = ReactDOM.renderToStaticMarkup(component);
    const b = ReactDOM.renderToStaticMarkup(<section>
      <p label="First">First</p>
      <p label="Second">Second</p>
      <p label="Third">Third</p>
    </section>);
    expect(a).toEqual(b);
  });
});
