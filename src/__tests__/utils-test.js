import { sliceModifiers } from '../utils';

describe('SliceModifiers', () => {
  const target = {
    type: 'div',
  };
  const tests = [
    [
      [1, 2, 3, 4, target],
      {
        mods: [1, 2, 3, 4],
        target,
      },
    ],
    [
      [target],
      {
        mods: [],
        target,
      },
    ],
    [
      target,
      {
        mods: [],
        target,
      },
    ],
    [
      [],
      {
        mods: [],
        target: undefined,
      },
    ],
  ];
  it('should split content properly', () => {
    tests.forEach((test) => {
      const res = sliceModifiers(test[0]);
      expect(res).toEqual(test[1]);
    });
  });
});
