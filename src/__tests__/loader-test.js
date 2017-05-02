import ReactDOM from 'react-dom/server';
import Loader from '../loader';
import factory from '../factory';
import testData from '../../test-data/data.json';
import testResult from '../../test-data/result.json';

function evalComponent(script, components = {}) {
  const foo = new Function('factory', 'components', 'props', `return ${script}(factory, components, props)`); // eslint-disable-line
  return foo(factory, components, {
    testData,
  });
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
  const BlockInABlock = {
    type: 'div',
    props: {
      children: 'BlockInABlock',
    },
  };
  const MyThirdBlock = {
    type: 'header',
    props: {
      children: {
        type: 'BlockInABlock',
      },
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
        BlockInABlock,
      },
    });
    return loader.compile(entry)
      .then((t) => {
        const body = evalComponent(t);
        const html = ReactDOM.renderToStaticMarkup(body);
        expect(html).toEqual('<div><section><header><div>BlockInABlock</div></header><p>Mid level block</p></section><header><div>BlockInABlock</div></header><p>Top level block</p></div>'); // eslint-disable-line
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
      .then((t) => {
        const body = evalComponent(t);
        const html = ReactDOM.renderToStaticMarkup(body);
        expect(html).toEqual('<p>This block is overriden</p>'); // eslint-disable-line
      }).then(done);
  });
});

describe('Heavy load', () => {
  const MyComponent = {
    type: 'p',
    evalProps: {
      children: 'props.testData.map(function (t) { return t[props.dataKey] })',
    },
  };
  const entry = {
    type: 'div',
    props: {
      children: [
        {
          type: 'MyComponent',
          evalProps: {
            testData: 'props.testData',
          },
          props: {
            dataKey: 'company',
          },
        },
        {
          type: 'MyComponent',
          evalProps: {
            testData: 'props.testData',
          },
          props: {
            dataKey: 'email',
          },
        },
        {
          type: 'MyComponent',
          evalProps: {
            testData: 'props.testData',
          },
          props: {
            dataKey: 'phone',
          },
        },
      ],
    },
  };
  it('should produce something with heavy load', (done) => {
    const loader = new Loader({
      blocks: {
        MyComponent,
      },
    });
    const tm1 = Date.now();
    return loader.compile(entry, 'Big')
      .then((t) => {
        const t0 = Date.now();
        const body = evalComponent(t);
        const t1 = Date.now();
        const html = ReactDOM.renderToStaticMarkup(body);
        const t2 = Date.now();
        console.log('Compile', t0 - tm1, 'ms');
        console.log('Eval', t1 - t0, 'ms');
        console.log('Render', t2 - t1, 'ms');
        expect(html).toEqual(testResult.str);
      }).then(done);
  });
});
