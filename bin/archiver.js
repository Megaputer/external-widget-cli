const path = require('node:path');
const fs = require('node:fs');
const JSZip = require('jszip');
const webpack = require('webpack');

async function runWebpack(config) {
  const util = require('node:util');
  const compiler = webpack(config);
  const webpackRun = util.promisify(compiler.run).bind(compiler);
  await webpackRun();
}

module.exports = async (config) => {
  try {
    await runWebpack(require(config)());
    const archiveName = path.basename(process.cwd());
    const zip = new JSZip();
    const basePath = path.resolve(process.cwd(), 'build');
    console.log(`Files from the path: ${basePath}`);
    const files = fs.readdirSync(basePath, { recursive: true });

    console.log('\nThe following files have been added to the archive:');
    for (const file of files) {
      const pathFile = path.resolve(basePath, file);
      if (fs.statSync(pathFile).isFile()) {
        const content = fs.readFileSync(pathFile);
        zip.file(file, content);
        console.log(` - ${file}`);
      }
    }

    zip.generateAsync({
      type: 'nodebuffer',
      compression: "DEFLATE",
      compressionOptions: 0
    })
    .then((content) => {
      const outPath = path.resolve(basePath, `${archiveName}.zip`);
      fs.writeFile(outPath, content, undefined, (err) => err && console.log(err));
    })
    .then(() => console.log(`\nArchive '${archiveName}' created`));
  } catch (error) {
    console.log(error);
  }
};
