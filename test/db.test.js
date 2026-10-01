const test = require('node:test');
const assert = require('node:assert/strict');
const { createRepo } = require('../src/db');

// Runs against a real PostgreSQL when PGHOST is set (CI service, docker compose).
test('notes are stored in PostgreSQL', { skip: !process.env.PGHOST && 'PGHOST not set' }, async () => {
  const repo = createRepo();
  try {
    await repo.migrate();
    const created = await repo.create('stored in postgres');
    const notes = await repo.list();
    assert.ok(notes.some((n) => n.id === created.id && n.text === 'stored in postgres'));
  } finally {
    await repo.end();
  }
});
