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
    ...props,
    [key]: fn(props),
  });
}

const reactify = reactifier({}, {
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
});
