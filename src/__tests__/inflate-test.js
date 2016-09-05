import { inflater } from '../index';

function scopedEval(str, params) {
  try {
    return (new Function(`with(this) { return ${str} }`)).call(params); // eslint-disable-line
  } catch (e) {
    console.log(`Could not eval ${str}`, params);
    return str;
  }
}

describe('Inflater', () => {
  const inflate = inflater({
    modifiers: [],
    injectors: {
      get: (str, params) =>
        params[str],
      eval: scopedEval,
    },
  });
  it('should leave uninjected target as is', (done) => {
    const target = {
      type: 'div',
      props: {
        c: 32,
      },
    };
    const inflated = inflate([
      {
        props: {
          a: 54,
          b: 42,
        },
      },
      target,
    ]);
    inflated.then(res =>
      expect(res).toEqual(target)
    ).then(done);
  });
  it('should produce a valid injected result', (done) => {
    const target = {
      type: 'div',
      props: {
        c: 'GET a',
        d: 'EVAL a + b',
        deep: {
          array: ['EVAL a - b', 'EVAL a * b'],
        },
      },
    };
    const inflated = inflate([
      {
        props: {
          a: 54,
          b: 42,
        },
      },
      target,
    ]);
    inflated.then(res =>
      expect(res.props).toEqual({
        c: 54,
        d: 96,
        deep: {
          array: [12, 2268],
        },
      })
    ).then(done);
  });
});
