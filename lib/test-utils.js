'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serve = serve;
exports.more = more;

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function serve(port, onRequest) {
  var server = _http2.default.createServer(onRequest);
  server.listen(port);
  return function () {
    return server.close();
  };
}

function more(stuff) {
  return stuff;
}