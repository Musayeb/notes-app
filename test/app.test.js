const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp, MAX_TEXT_LENGTH } = require('../src/app');

function memoryRepo({ up = true } = {}) {
  const notes = [];
  return {
    async list() {
      return [...notes].reverse();
    },
    async create(text) {
      const note = { id: notes.length + 1, text, created_at: new Date().toISOString() };
      notes.push(note);
      return note;
    },
    async ping() {
      if (!up) throw new Error('down');
    },
  };
}

test('GET /health answers even when the database is down', async () => {
  const app = createApp({ repo: memoryRepo({ up: false }) });
  await request(app).get('/health').expect(200, { status: 'ok' });
});

test('GET /ready returns 503 when the database is down', async () => {
  const app = createApp({ repo: memoryRepo({ up: false }) });
  await request(app).get('/ready').expect(503);
});

test('a created note is returned by the list, newest first', async () => {
  const app = createApp({ repo: memoryRepo() });
  await request(app).post('/api/notes').send({ text: 'first' }).expect(201);
  await request(app).post('/api/notes').send({ text: '  second  ' }).expect(201);

  const res = await request(app).get('/api/notes').expect(200);
  assert.deepEqual(res.body.map((n) => n.text), ['second', 'first']);
});

test('an empty or too long note is rejected', async () => {
  const app = createApp({ repo: memoryRepo() });
  await request(app).post('/api/notes').send({ text: '   ' }).expect(400);
  await request(app).post('/api/notes').send({}).expect(400);
  await request(app)
    .post('/api/notes')
    .send({ text: 'x'.repeat(MAX_TEXT_LENGTH + 1) })
    .expect(400);
});

test('GET /api/version returns the configured version', async () => {
  const app = createApp({ repo: memoryRepo(), version: '1.2.3' });
  await request(app).get('/api/version').expect(200, { version: '1.2.3' });
});
