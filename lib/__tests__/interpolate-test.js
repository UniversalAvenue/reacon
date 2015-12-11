'use strict';

jest.autoMockOff();

var interpolate = require('../index').interpolate;
var inject = require('../index').inject;
var _ = require('lodash');

describe('interpolate', function () {
  it('should produce a compiler fn for Freds name', function () {
    var alpha = interpolate({ fred: 'TEMPLATE His name is ${data.name}' });
    expect(alpha.fred({ name: 'Fred' })).toEqual('His name is Fred');
  });
  it('should produce two compiler fn for Fred and Anna', function () {
    var alpha = interpolate({
      fred: 'TEMPLATE His name is ${data.name}',
      anna: 'TEMPLATE Her name is ${data.name}'
    });
    expect(alpha.fred({ name: 'Fred' })).toEqual('His name is Fred');
    expect(alpha.anna({ name: 'Anna' })).toEqual('Her name is Anna');
  });
  it('should produce two compiler fn one level deep for Fred and Anna', function () {
    var alpha = interpolate({
      chars: {
        fred: 'TEMPLATE His name is ${data.name}',
        anna: 'TEMPLATE Her name is ${data.name}'
      }
    });
    expect(alpha.chars.fred({ name: 'Fred' })).toEqual('His name is Fred');
    expect(alpha.chars.anna({ name: 'Anna' })).toEqual('Her name is Anna');
  });
});

describe('inject', function () {
  it('should inject values into compiled interpolation', function () {
    var alpha = interpolate({
      chars: {
        fred: 'TEMPLATE His name is ${data.fred}',
        anna: 'TEMPLATE Her name is ${data.anna}'
      }
    });

    var res = inject(alpha)({ fred: 'Fred', anna: 'Anna' });
    expect(res.chars.fred).toEqual('His name is Fred');
    expect(res.chars.anna).toEqual('Her name is Anna');
  });
  it('should inject values into compiled getters', function () {
    var alpha = interpolate({
      person: {
        name: 'GET data.name',
        age: 'GET data.age',
        roles: 'GET data.roles'
      }
    });

    var res = inject(alpha)({ name: 'Fred', age: 5, roles: [1, 2, 3] });
    expect(res.person.name).toEqual('Fred');
    expect(res.person.age).toEqual(5);
    expect(res.person.roles).toEqual([1, 2, 3]);
  });
  it('should preserve object type', function () {
    var alpha = interpolate({
      person: {
        age: 'GET data.age',
        roles: [{ roleName: 'GET data.roles[0].name' }, { roleName: 'GET data.roles[1].name' }, { roleName: 'GET data.roles[2].name' }]
      }
    });

    var res = inject(alpha)({
      age: 5,
      roles: [{ name: 'Kalle' }, { name: 'Josefin' }, { name: 'Anna' }]
    });
    expect(res.person.roles[1].roleName).toEqual('Josefin');
    expect(_.isNumber(res.person.age)).toEqual(true);
    expect(_.isArray(res.person.roles)).toEqual(true);
  });
});