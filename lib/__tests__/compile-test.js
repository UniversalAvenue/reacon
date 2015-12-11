'use strict';

jest.autoMockOff();

var compile = require('../index').compile;

describe('Compile', function () {
  it('should produce a simple p tag', function () {
    var res = compile({
      component: 'p',
      children: 'TEMPLATE Fred lives in ${data.city}'
    });
    expect(res({ city: 'Stockholm' }).children).toEqual('Fred lives in Stockholm');
  });
  it('should produce a complex div tag', function () {
    var res = compile({
      component: 'div',
      children: [{ key: 'p1', component: 'p', children: 'Lovely' }, { key: 'p2', component: 'p', children: 'Lovely f2' }, { key: 'p3', component: 'p', children: 'TEMPLATE Lovely ${data.str}' }]
    });
    expect(res({ str: 'weather2' }).children[2].children).toEqual('Lovely weather');
  });
});