#!/usr/bin/env node
const path = require('node:path');
const yargs = require('yargs/yargs');
const { generate } = require('./generator.js');
const archive = require('./archiver.js');


yargs(process.argv.splice(2))
  .command('create', 'create widget', () => {}, generate)
  .command('archive', 'create an archive with widgets',
      { 
        webpackConfig: {
          describe: 'Path to your webpack configuration file. Defaults to ./webpack.config.js',
          default: './webpack.config.js'
        } 
      },
      (argv) => archive(path.join(process.cwd(), argv['webpack-config'])))
  .demandCommand(1, 1, 'choose a command: create or archive')
  .strict()
  .help('h')
  .parse();
