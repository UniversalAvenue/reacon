# Reacon - React component notation

[![Circle CI](https://circleci.com/gh/UniversalAvenue/reacon/tree/master.svg?style=svg&circle-token=d904c30b9ca770185a0d32f4eccc4935d8e16543)](https://circleci.com/gh/UniversalAvenue/reacon/tree/master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Use `reacon` to compile a plain json object into a composite React component. 

    npm install reacon

Examples

    import { reactify } from 'reacon';
    
    const injectable = reactify({
      component: 'div',
      children: {
        {
          component: 'p',
          children: 'This is a paragraf',
        },
        {
          component: 'p',
          children: 'TEMPLATE Interpolate with ${data.value} and ${props.value}',
        },
      },
    });

    const Component = injectable({ value: 'data' });

    return <Component value="props" />;

Will produce the following:

    <div>
      <p>This is a paragraf</p>
      <p>Interpolate with data and props</p>
    </div>

`reactify` can also be extended with custom components.

    const MyComponent = ({ arg }) => {
      return <div>{arg}</div>;
    };

    const injectable = reactify({
      component: 'MyComponent',
      arg: 'Hello',
    }, { MyComponent });

Which will produce:

    <div>Hello</div>
