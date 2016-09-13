'use strict';

var _utils = require('../utils');

describe('SliceModifiers', function () {
  var target = {
    type: 'div'
  };
  var tests = [[[1, 2, 3, 4, target], {
    mods: [1, 2, 3, 4],
    target: target
  }], [[target], {
    mods: [],
    target: target
  }], [target, {
    mods: [],
    target: target
  }], [[], {
    mods: [],
    target: undefined
  }]];
  it('should split content properly', function () {
    tests.forEach(function (test) {
      var res = (0, _utils.sliceModifiers)(test[0]);
      expect(res).toEqual(test[1]);
    });
  });
});