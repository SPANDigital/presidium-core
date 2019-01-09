#! /usr/bin/env node
var yargs = require('yargs');
var config = require('../src/config');
var presidium = require('../src/presidium');
var version = require('../src/version');
var conf = config.load('_config.yml');

let scopeArg = {
  alias: 'scope',
  describe: 'Optional scope to include',
  choices: ['internal', 'external'],
  string: 'scope'
};

var argv = yargs.usage('$0 command')
  .command('requirements', 'Install jekyll gems and npm dependencies', function () {
    presidium.requirements(conf);
  })
  .command('clean', 'Clean build directory', function () {
    presidium.clean(conf);
  })
  .command('install', 'Install jekyll gems and npm dependencies', function () {
    presidium.install(conf);
  })
  .command('generate', 'Generate site sources', function (yargs) {
    return yargs
      .option('s', scopeArg);
  }, function (argv) {
    conf.scope = argv['s'];
    presidium.generate(conf);
  })
  .command('build', 'Build site', function (yargs) {
    return yargs
      .option('s', scopeArg);
  }, function (argv) {
    conf.scope = argv['s'];
    presidium.generate(conf);
    presidium.build(conf);
  })
  .command('validate', 'Validate generated site', function (yargs) {
    return yargs
      .option('s', scopeArg);
  }, function (argv) {
    conf.scope = argv['s'];
    presidium.clean(conf);
    presidium.generate(conf);
    presidium.build(conf);
    presidium.validate(conf);
  })
  .command('watch', 'Watch for content and media updates', function () {
    presidium.watch(conf);
  })
  .command('develop', 'Watch presidium sources (for development)', function () {
    presidium.develop(conf);
  })
  .command('serve', 'Serve site', function () {
    presidium.serve(conf);
  })
  .command('start', 'Build and serve', function (yargs) {
    return yargs
      .option('s', scopeArg);
  }, function (argv) {
    conf.scope = argv['s'];
    presidium.clean(conf);
    presidium.generate(conf);
    version.islocal(conf);
    presidium.watch(conf);
    presidium.serve(conf);
  })
  .command('clean-gh-pages', 'Remove old versions.', function (yargs) {
    return yargs
      .option('v', {
        alias: 'version',
        describe: 'Semantic version number you wish to delete.',
        demand: 'You must supply a version to delete.',
        string: 'version'
      });
  }, function (argv) {
    version.clean(argv['v'], conf);
  })
  .command('gh-pages', 'Publish to Github Pages', function (yargs) {
    return yargs
      .option('v', {
        alias: 'version',
        describe: 'Semantic version number to publish with. \n If omitted, it defaults to publishing "latest".',
        string: 'version'
      })
      .option('s', scopeArg);
  }, function (argv) {
    conf = config.load('_config.yml', argv['v'] || '');
    conf.scope = argv['s'];
    presidium.clean(conf);
    presidium.generate(conf);
    version.init(conf);
    presidium.build(conf);
    presidium.ghPages(conf);
  })
  .demand(1, 'must provide a valid command')
  .help('h').alias('h', 'help')
  .argv;
