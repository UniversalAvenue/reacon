import Browser from 'zombie';
import fs from 'fs';
import Loader from '../loader';
import { serve } from '../test-utils';

const reactScript = fs.readFileSync('node_modules/react/dist/react.js', 'utf8');
const reactDOMScript = fs.readFileSync('node_modules/react-dom/dist/react-dom.js', 'utf8');
Browser.localhost('example.com', 3089);

const page = {
  type: 'div',
  props: {
    children: [
      {
        type: 'MyComponent',
        props: {
          text: 'Sign up',
        },
      },
      {
        type: 'MyGlobalComponent',
      },
    ],
  },
};

const MyComponent = {
  type: 'button',
  props: {
    children: 'Sign up',
  },
};

const loader = new Loader({
  blocks: {
    MyComponent,
  },
  globals: ['MyGlobalComponent'],
});

const doc = loader.compile(page, 'Page')
  .then(script => `<html>
    <body>
      <script>${reactScript}</script>
      <script>${reactDOMScript}</script>
      <div id="app"></div>
      <script>
        function Component(props) {
          return React.createElement('button', {}, 'My global button');
        }
        var components = {
          MyGlobalComponent: Component,
        };
        function factory(Comp, props) {
          return React.createElement(Comp, props);
        }
        const body = ${script}(factory, components);
        ReactDOM.render(
          body,
          document.getElementById('app')
        );
      </script>
    </body>
  </html>`);

describe('User visits index page', () => {
  const browser = new Browser();
  let stop;
  let originalTimeout;

  beforeEach(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  beforeEach((done) => {
    stop = serve(3089, (req, res) => {
      doc.then(d => res.end(d))
        .catch(e => console.error(e));
    });
    browser.visit('/').then(done);
  });

  afterEach(() => {
    stop();
  });

  describe('Is ok', () => {
    it('should be successful', () => {
      browser.pressButton('Sign up');
      browser.pressButton('My global button');
      return browser.assert.success();
    });
  });
});
