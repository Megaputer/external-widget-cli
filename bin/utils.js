const process = require('node:process');
const fs = require('node:fs');
const path = require('node:path');

module.exports = (targetPath) => {
  const srcPath = path.resolve(process.cwd(), 'src');
  const entry = {};
  const patterns = [];
  const files = fs.readdirSync(srcPath, { recursive: true }).filter(p => p.includes('info.json'));
  for (const infoJson of files) {
    const { guid, dependencies } = require(path.resolve(srcPath, infoJson));
    const dirname = path.dirname(path.resolve(srcPath, infoJson));
    entry[guid] = {
      'import': `./src/${path.dirname(infoJson)}/model.tsx`,
      'filename': `${guid}/widget.js`
    };

    ['info.json', ...dependencies].forEach(f => {
      patterns.push({
        from: `${dirname}/${f}`,
        to: path.resolve(targetPath, guid, f)
      });
    });
  }
  return { entry, patterns };
};
