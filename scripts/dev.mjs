import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const serverEntry = fileURLToPath(new URL('../server/index.mjs', import.meta.url));
const viteEntry = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));

const server = spawn(process.execPath, [serverEntry], { stdio: 'inherit' });
const client = spawn(process.execPath, [viteEntry], { stdio: 'inherit' });
const children = [server, client];

let shuttingDown = false;

const shutdown = (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = exitCode;
};

for (const child of children) {
  child.once('error', () => shutdown(1));
  child.once('exit', (code, signal) => {
    if (!shuttingDown && (code ?? 1) !== 0) {
      console.error(`Development process stopped (${signal ?? `exit ${code}`}).`);
      shutdown(code ?? 1);
    }
  });
}

process.once('SIGINT', () => shutdown());
process.once('SIGTERM', () => shutdown());
