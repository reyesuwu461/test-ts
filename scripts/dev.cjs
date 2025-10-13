const { spawn } = require('child_process');
const path = require('path');

// Cross-platform way to set env var for child process
const env = Object.create(process.env);
env.VITE_MSW = 'true';

function resolveLocalBin(packageName) {
  try {
    // resolve the package.json of the package and find its bin
    const pkgPath = require.resolve(path.join(packageName, 'package.json'));
    const pkg = require(pkgPath);
    const bin = pkg.bin && (typeof pkg.bin === 'string' ? pkg.bin : pkg.bin['vite'] || Object.values(pkg.bin)[0]);
    if (!bin) return null;
    return path.join(path.dirname(pkgPath), bin);
  } catch (e) {
    return null;
  }
}

const viteCli = resolveLocalBin('vite');

let child;
if (viteCli) {
  // spawn node with the vite CLI entry script
  child = spawn(process.execPath, [viteCli], { stdio: 'inherit', env });
} else {
  // fallback to npx (may prompt)
  child = spawn('npx', ['vite'], { stdio: 'inherit', env, shell: true });
}

child.on('exit', (code) => {
  process.exit(code);
});
