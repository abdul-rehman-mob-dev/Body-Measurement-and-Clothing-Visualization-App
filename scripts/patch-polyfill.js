const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  'node_modules',
  '@expo',
  'browser-polyfill',
  'src',
  'DOM',
  'HTMLImageElement.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');

  const oldCode = `  _load() {
    if (this.src) {
      if (
        typeof this.src === 'string' &&
        this.src.startsWith &&
        this.src.startsWith('data:')
      ) {`;

  const newCode = `  _load() {
    if (this.src) {
      if (typeof this.src !== 'string') {
        this.complete = true;
        return;
      }
      if (
        typeof this.src === 'string' &&
        this.src.startsWith &&
        this.src.startsWith('data:')
      ) {`;

  if (content.includes('if (typeof this.src !== \'string\'))')) {
    console.log('Polyfill already patched.');
  } else if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Patched @expo/browser-polyfill HTMLImageElement.js successfully.');
  } else {
    console.log('Could not find code to patch in HTMLImageElement.js');
  }
}
