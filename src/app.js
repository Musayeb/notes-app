const path = require('node:path');
const express = require('express');

const MAX_TEXT_LENGTH = 500;

function createApp({ repo, version = process.env.APP_VERSION || 'dev' }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Liveness: the process answers. Never checks the database, otherwise a
  // database outage would restart every pod in a loop.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Readiness: the pod can serve traffic, which needs the database.
  app.get('/ready', async (req, res) => {
    try {
      await repo.ping();
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.get('/api/version', (req, res) => {
    res.json({ version });
  });

  app.get('/api/notes', async (req, res) => {
    res.json(await repo.list());
  });

  app.post('/api/notes', async (req, res) => {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text || text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ error: `text must be 1 to ${MAX_TEXT_LENGTH} characters` });
    }
    res.status(201).json(await repo.create(text));
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  });

  return app;
}

module.exports = { createApp, MAX_TEXT_LENGTH };
