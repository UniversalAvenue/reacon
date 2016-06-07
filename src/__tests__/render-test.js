jest.autoMockOff();

const React = require('react');
const TestUtils = require('react-addons-test-utils');

const reactify = require('../index').reactify;

class Wrapper extends React.Component {
  render() {
    return <div {...this.props}/>;
  }
}
const renderInto = Component => {
  return TestUtils.renderIntoDocument(<Wrapper><Component /></Wrapper>);
};

const findTag = (comp, tag) => {
  return TestUtils.findRenderedDOMComponentWithTag(comp, tag);
};

describe('Compile', () => {
  it('should produce a simple p tag', () => {
    const res = reactify({
      component: 'p',
      id: '5',
      amount: 5,
      children: 'TEMPLATE Fred lives in ${data.city}',
    });
    const comp = renderInto(res({ city: 'Stockholm' }));
    const p = findTag(comp, 'p');
    expect(p.innerHTML).toEqual('Fred lives in Stockholm');
  });
  it('should produce a complex div tag', () => {
    const res = reactify({
      component: 'div',
      children: [
        { key: 'p3', component: 'p', children: [ 'TEMPLATE Lovely ${data.str}' ] },
      ],
    });
    const comp = renderInto(res({ str: 'weather' }));
    const p = findTag(comp, 'p');
    expect(p.innerHTML).toEqual('<!-- react-text: 4 -->Lovely weather<!-- /react-text -->');
  });
  it('should produce a constant nested array', () => {
    const res = reactify({
      component: 'div',
      children: [
        { key: 'p3', component: 'p', children: [ 'constant' ] },
      ],
    });
    const comp = renderInto(res({ str: 'weather' }));
    const p = findTag(comp, 'p');
    expect(p.innerHTML).toEqual('<!-- react-text: 4 -->constant<!-- /react-text -->');
  });
  it('should produce a nested array', () => {
    const res = reactify({
      component: 'div',
      children: [
        { key: 'p3', component: 'p', children: [ 42 ] },
      ],
    });
    const comp = renderInto(res({ str: 'weather' }));
    const p = findTag(comp, 'p');
    expect(p.innerHTML).toEqual('<!-- react-text: 4 -->42<!-- /react-text -->');
  });
});
