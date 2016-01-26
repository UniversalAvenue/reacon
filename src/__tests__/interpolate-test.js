jest.autoMockOff();

const interpolate = require('../index').interpolate;
const inject = require('../index').inject;
const _ = require('lodash');

describe('interpolate', () => {
  it('should produce a compiler fn for Freds name', () => {
    const alpha = interpolate({ fred: 'TEMPLATE His name is ${data.name}' });
    expect(alpha.fred({ name: 'Fred' })).toEqual('His name is Fred');
  });
  it('should produce two compiler fn for Fred and Anna', () => {
    const alpha = interpolate({
      fred: 'TEMPLATE His name is ${data.name}',
      anna: 'TEMPLATE Her name is ${data.name}',
    });
    expect(alpha.fred({ name: 'Fred' })).toEqual('His name is Fred');
    expect(alpha.anna({ name: 'Anna' })).toEqual('Her name is Anna');
  });
  it('should produce two compiler fn one level deep for Fred and Anna', () => {
    const alpha = interpolate({
      chars: {
        fred: 'TEMPLATE His name is ${data.name}',
        anna: 'TEMPLATE Her name is ${data.name}',
      },
    });
    expect(alpha.chars.fred({ name: 'Fred' })).toEqual('His name is Fred');
    expect(alpha.chars.anna({ name: 'Anna' })).toEqual('Her name is Anna');
  });
});

describe('inject', () => {
  it('should inject values into compiled interpolation', () => {
    const alpha = interpolate({
      chars: {
        fred: 'TEMPLATE His name is ${data.fred}',
        anna: 'TEMPLATE Her name is ${data.anna}',
      },
    });

    const res = inject(alpha)({ fred: 'Fred', anna: 'Anna' });
    expect(res.chars.fred).toEqual('His name is Fred');
    expect(res.chars.anna).toEqual('Her name is Anna');
  });
  it('should inject values into compiled getters', () => {
    const alpha = interpolate({
      person: {
        name: 'GET data.name',
        age: 'GET data.age',
        roles: 'GET data.roles',
      },
    });

    const res = inject(alpha)({ name: 'Fred', age: 5, roles: [ 1, 2, 3 ] });
    expect(res.person.name).toEqual('Fred');
    expect(res.person.age).toEqual(5);
    expect(res.person.roles).toEqual([ 1, 2, 3 ]);
  });
  it('should preserve object type', () => {
    const alpha = interpolate({
      person: {
        age: 'GET data.age',
        roles: [
          { roleName: 'GET data.roles[0].name' },
          { roleName: 'GET data.roles[1].name' },
          { roleName: 'GET data.roles[2].name' },
        ],
      },
    });

    const res = inject(alpha)({
      age: 5,
      roles: [
        { name: 'Kalle' },
        { name: 'Josefin' },
        { name: 'Anna' },
      ],
    });
    expect(res.person.roles[1].roleName).toEqual('Josefin');
    expect(_.isNumber(res.person.age)).toEqual(true);
    expect(_.isArray(res.person.roles)).toEqual(true);
  });
  it('should preserve primitive type', () => {
    const alpha = interpolate({
      person: {
        age: 15,
        numbers: [
          1, 2, 3,
        ],
      },
    });

    const res = inject(alpha)({
    });
    expect(res.person.age).toEqual(15);
    expect(res.person.numbers).toEqual([ 1, 2, 3 ]);
  });
});
