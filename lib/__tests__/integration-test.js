'use strict';

var _zombie = require('zombie');

var _zombie2 = _interopRequireDefault(_zombie);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _loader = require('../loader');

var _loader2 = _interopRequireDefault(_loader);

var _testUtils = require('../test-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reactScript = _fs2.default.readFileSync('node_modules/react/dist/react.js', 'utf8');
var reactDOMScript = _fs2.default.readFileSync('node_modules/react-dom/dist/react-dom.js', 'utf8');
_zombie2.default.localhost('example.com', 3089);

var page = {
  type: 'div',
  props: {
    children: [{
      type: 'MyComponent',
      props: {
        text: 'Sign up'
      }
    }, {
      type: 'MyGlobalComponent'
    }]
  }
};

var MyComponent = {
  type: 'button',
  evalProps: {
    children: 'props.text'
  }
};

var loader = new _loader2.default({
  blocks: {
    MyComponent: MyComponent
  },
  globals: ['MyGlobalComponent']
});

var doc = loader.compile(page, 'Page').then(function (script) {
  return '<html>\n    <body>\n      <script>' + reactScript + '</script>\n      <script>' + reactDOMScript + '</script>\n      <div id="app"></div>\n      <script>\n        function Component(props) {\n          return React.createElement(\'button\', {}, \'My global button\');\n        }\n        var components = {\n          MyGlobalComponent: Component,\n        };\n        const Page = ' + script + '(React, components);\n        ReactDOM.render(\n          React.createElement(Page),\n          document.getElementById(\'app\')\n        );\n      </script>\n    </body>\n  </html>';
});

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
      doc.then(function (d) {
        return res.end(d);
      }).catch(function (e) {
        return console.error(e);
      });
    });
    browser.visit('/').then(done);
  });

  afterEach(function () {
    stop();
  });

  describe('Is ok', function () {
    it('should be successful', function () {
      browser.pressButton('Sign up');
      browser.pressButton('My global button');
      return browser.assert.success();
    });
  });
});