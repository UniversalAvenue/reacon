import http from 'http';

export function serve(port, onRequest) {
  const server = http.createServer(onRequest);
  server.listen(port, () => console.log('Serving', port));
  return () => server.close();
}
