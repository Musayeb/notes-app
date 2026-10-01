const { createApp } = require('./app');
const { createRepo } = require('./db');

const port = Number(process.env.PORT) || 3000;

async function waitForDatabase(repo, attempts = 30, delayMs = 2000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await repo.ping();
      return;
    } catch (err) {
      console.log(`database not ready (${i}/${attempts}): ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('database never became ready');
}

async function main() {
  const repo = createRepo();
  await waitForDatabase(repo);
  await repo.migrate();

  const server = createApp({ repo }).listen(port, () => {
    console.log(`listening on port ${port}`);
  });

  const shutdown = () => {
    server.close(() => repo.end().finally(() => process.exit(0)));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
