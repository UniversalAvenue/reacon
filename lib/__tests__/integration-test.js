'use strict';

var _zombie = require('zombie');

var _zombie2 = _interopRequireDefault(_zombie);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _scriptifier = require('../scriptifier');

var _scriptifier2 = _interopRequireDefault(_scriptifier);

var _testUtils = require('../test-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reactScript = _fs2.default.readFileSync('node_modules/react/dist/react.js', 'utf8');
var reactDOMScript = _fs2.default.readFileSync('node_modules/react-dom/dist/react-dom.js', 'utf8');
_zombie2.default.localhost('example.com', 3089);

var scriptifier = new _scriptifier2.default({
  MyComponent: 'test'
});
var myComponentScript = scriptifier.scriptComponent({
  type: 'div',
  displayName: 'MyComponent',
  props: {
    children: {
      type: 'button',
      props: {
        children: 'Sign up'
      }
    }
  }
});

var componentScript = scriptifier.scriptify({
  type: 'div',
  props: {
    children: {
      type: 'MyComponent'
    }
  }
});

var doc = '<html>\n  <body>\n    <script>' + reactScript + '</script>\n    <script>' + reactDOMScript + '</script>\n    <script>' + myComponentScript + '</script>\n    <div id="app"></div>\n    <script>\n      var components = {\n        MyComponent: MyComponent,\n      };\n      ReactDOM.render(\n        ' + componentScript + ',\n        document.getElementById(\'app\')\n      );\n    </script>\n  </body>\n</html>';

describe('User visits index page', function () {
  var browser = new _zombie2.default();
  var stop = void 0;
  var originalTimeout = void 0;

  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  beforeEach(function (done) {
    stop = (0, _testUtils.serve)(3089, function (req, res) {
      res.end(doc);
    });
    browser.on('loaded', function () {
      return console.log('Idle');
    });
    browser.visit('/').then(done);
  });

  afterEach(function () {
    stop();
  });

  describe('Is ok', function () {
    it('should be successful', function () {
      browser.pressButton('Sign up');
      browser.assert.success();
    });
  });
});