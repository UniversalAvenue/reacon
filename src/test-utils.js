import http from 'http';

export function serve(port, onRequest) {
  const server = http.createServer(onRequest);
  server.listen(port);
  return () => server.close();
}

export function more(stuff) {
  return stuff;
}
