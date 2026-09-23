import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createApp } from './server/src/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.RUNNING_WITH_VITE = 'true';

async function startFullStackServer() {
  const app = createApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Dynamically attach Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[Dev Server] Vite middleware mounted.');
  } else {
    // Production mode: Serve pre-built static client files from dist/
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Good Luck Hair Salon] Full-stack application ready at http://0.0.0.0:${PORT}`);
  });

  return { app, server };
}

startFullStackServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
