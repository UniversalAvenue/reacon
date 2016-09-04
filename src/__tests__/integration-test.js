import Browser from 'zombie';
import { serve } from '../test-utils';

Browser.localhost('example.com', 3089);

const stop = serve(3089, (req, res) => {
  res.end('<html><body><button>Sign up</button></body></html>');
});

describe('User visits index page', () => {
  const browser = new Browser();

  beforeEach(() => {
    return browser.visit('/');
  });

  afterEach(() => {
    stop();
  });

  describe('Is ok', () => {
    beforeEach(() => {
      return browser.pressButton('Sign up');
    });

    it('should be successful', () => {
      browser.assert.success();
    });
  });
});
