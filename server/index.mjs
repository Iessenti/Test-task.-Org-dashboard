import { createMockServer } from './app.mjs';

const port = Number(process.env.API_PORT ?? 3001);
const host = process.env.API_HOST ?? '127.0.0.1';

const server = createMockServer();

server.listen(port, host, () => {
  console.log(`Mock server listening on http://${host}:${port}`);
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
  server.closeRealtimeClients();
  server.close(() => process.exit(0));
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
