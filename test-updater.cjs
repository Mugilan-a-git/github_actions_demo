const { spawn } = require('child_process');
const path = require('path');
const exePath = path.join(__dirname, 'dist-electron', 'win-unpacked', 'github-actions.exe');
console.log('Running:', exePath);
const p = spawn(exePath, [], {
  env: { ...process.env, ELECTRON_ENABLE_LOGGING: 'true' }
});
p.stdout.on('data', d => process.stdout.write(d.toString()));
p.stderr.on('data', d => process.stderr.write(d.toString()));
setTimeout(() => {
  console.log('Test complete. Killing process.');
  p.kill();
}, 10000);
