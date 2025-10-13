const { spawn } = require('child_process');

// Cross-platform way to set env var for child process
const env = Object.create(process.env);
env.VITE_MSW = 'true';

const child = spawn('npx', ['vite'], {
  stdio: 'inherit',
  env,
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code);
});
