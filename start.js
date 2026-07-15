const { spawn } = require('child_process');
const path = require('path');

console.log('[Runner] Starting FraudAlert Lite Platform...');

// Spawn backend Express process
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'inherit'
});

// Spawn frontend Vite process
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
  stdio: 'inherit'
});

backend.on('close', (code) => {
  console.log(`[Runner] Backend process exited with code ${code}`);
  process.exit(code);
});

frontend.on('close', (code) => {
  console.log(`[Runner] Frontend process exited with code ${code}`);
  process.exit(code);
});
