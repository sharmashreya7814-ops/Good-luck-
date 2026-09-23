import { app } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export function startStandaloneServer() {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Good Luck Salon Server] Listening on http://0.0.0.0:${PORT}`);
  });
  return server;
}

if (process.env.NODE_ENV !== 'test' && !process.env.RUNNING_WITH_VITE) {
  startStandaloneServer();
}
