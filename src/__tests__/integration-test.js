import Browser from 'zombie';
import fs from 'fs';
import Scriptifier from '../scriptifier';
import { serve } from '../test-utils';

const reactScript = fs.readFileSync('node_modules/react/dist/react.js', 'utf8');
const reactDOMScript = fs.readFileSync('node_modules/react-dom/dist/react-dom.js', 'utf8');
Browser.localhost('example.com', 3089);

const scriptifier = new Scriptifier({
  MyComponent: 'test',
});
const myComponentScript = scriptifier.scriptComponent({
  type: 'div',
  displayName: 'MyComponent',
  props: {
    children: {
      type: 'button',
      props: {
        children: 'Sign up',
      },
    },
  },
});

const componentScript = scriptifier.scriptify({
  type: 'div',
  props: {
    children: {
      type: 'MyComponent',
    },
  },
});

const doc = `<html>
  <body>
    <script>${reactScript}</script>
    <script>${reactDOMScript}</script>
    <script>${myComponentScript}</script>
    <div id="app"></div>
    <script>
      var components = {
        MyComponent: MyComponent,
      };
      ReactDOM.render(
        ${componentScript},
        document.getElementById('app')
      );
    </script>
  </body>
</html>`;

describe('User visits index page', () => {
  const browser = new Browser();
  let stop;  
  let originalTimeout;

  beforeEach(function() {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  beforeEach((done) => {
    stop = serve(3089, (req, res) => {
      res.end(doc);
    });
    browser.on('loaded', (e) => console.log('Idle'));
    browser.visit('/').then(done);
  });

  afterEach(() => {
    stop();
  });

  describe('Is ok', () => {

    it('should be successful', () => {
      browser.pressButton('Sign up');
      browser.assert.success();
    });
  });
});
