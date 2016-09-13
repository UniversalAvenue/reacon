'use strict';

var _index = require('../index');

function scopedEval(str, params) {
  try {
    return new Function('with(this) { return ' + str + ' }').call(params); // eslint-disable-line
  } catch (e) {
    console.log('Could not eval ' + str, params);
    return str;
  }
}

describe('Inflater', function () {
  var inflate = (0, _index.inflater)({
    modifiers: [],
    injectors: {
      get: function get(str, params) {
        return params[str];
      },
      eval: scopedEval
    }
  });
  it('should leave uninjected target as is', function (done) {
    var target = {
      type: 'div',
      props: {
        c: 32
      }
    };
    var inflated = inflate([{
      props: {
        a: 54,
        b: 42
      }
    }, target]);
    inflated.then(function (res) {
      return expect(res).toEqual(target);
    }).then(done);
  });
  it('should produce a valid injected result', function (done) {
    var target = {
      type: 'div',
      props: {
        c: 'GET a',
        d: 'EVAL a + b',
        deep: {
          array: ['EVAL a - b', 'EVAL a * b']
        }
      }
    };
    var inflated = inflate([{
      props: {
        a: 54,
        b: 42
      }
    }, target]);
    inflated.then(function (res) {
      return expect(res.props).toEqual({
        c: 54,
        d: 96,
        deep: {
          array: [12, 2268]
        }
      });
    }).then(done);
  });
});