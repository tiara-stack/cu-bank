import type { FullConfig } from '@playwright/test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

export default async function globalSetup(config: FullConfig) {
  // The application hardcodes port 4000 and the workbook uses shared account IDs.
  if (config.workers !== 1) {
    throw new Error('Use one worker so each case can restore the workbook fixtures.');
  }

  const portCheck = createServer();
  await new Promise<void>((resolve, reject) => {
    portCheck.once('error', reject);
    portCheck.listen(4000, () => portCheck.close(() => resolve()));
  });

  const mongo = await MongoMemoryServer.create({
    instance: { dbName: 'cu_bank_playwright' },
  });
  const mongoUri = mongo.getUri();
  process.env.PLAYWRIGHT_MONGO_URI = mongoUri;

  const backend = spawn(process.execPath, ['server.js'], {
    cwd: fileURLToPath(new URL('../../backend', import.meta.url)),
    env: {
      ...process.env,
      MONGO_URI: mongoUri,
      PORT: '4000',
      NODE_ENV: 'test',
      JWT_SECRET: randomBytes(32).toString('hex'),
      JWT_EXPIRE: '1h',
      JWT_COOKIE_EXPIRE: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const cleanup = async () => {
    try {
      if (backend.exitCode === null && backend.signalCode === null) {
        const exited = once(backend, 'exit');
        const timeout = setTimeout(() => backend.kill('SIGKILL'), 5_000);
        backend.kill('SIGTERM');
        try {
          await exited;
        } finally {
          clearTimeout(timeout);
        }
      }
    } finally {
      await mongo.stop();
      delete process.env.PLAYWRIGHT_MONGO_URI;
    }
  };

  try {
    await new Promise<void>((resolve, reject) => {
      let output = '';
      const timeout = setTimeout(() => {
        finish(new Error(`Backend startup timed out.\n${output}`));
      }, 30_000);
      const onError = (error: Error) => finish(error);
      const onExit = () => finish(new Error(`Backend exited during startup.\n${output}`));
      const onOutput = (chunk: Buffer) => {
        output += chunk.toString();
        if (output.includes('MongoDB Connected:') && output.includes('Server running in test')) {
          finish();
        }
      };
      const finish = (error?: Error) => {
        clearTimeout(timeout);
        backend.off('error', onError);
        backend.off('exit', onExit);
        backend.stdout.off('data', onOutput);
        backend.stderr.off('data', onOutput);
        if (error) reject(error);
        else resolve();
      };
      backend.once('error', onError);
      backend.once('exit', onExit);
      backend.stdout.on('data', onOutput);
      backend.stderr.on('data', onOutput);
    });
  } catch (error) {
    await cleanup();
    throw error;
  }

  return cleanup;
}
