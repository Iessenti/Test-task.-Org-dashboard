import { createServer } from 'node:http';

const port = Number(process.env.API_PORT ?? 3001);

const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock server listening on http://127.0.0.1:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Mock server port ${port} is already in use. Set API_PORT in .env to another free port.`);
  } else {
    console.error('Mock server failed to start.', error);
  }
  process.exitCode = 1;
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
