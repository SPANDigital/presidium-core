#! /usr/bin/env node
var yargs = require('yargs');
var config = require('../src/config');
var presidium = require('../src/presidium');
var conf = config.load('_config.yml');

var argv = yargs.usage('$0 command')
    .command('requirements', 'Install jekyll gems and npm dependencies', function (yargs) {
        presidium.requirements(conf);
    })
    .command('clean', 'Clean build directory', function (yargs) {
        presidium.clean(conf);
    })
    .command('install', 'Install jekyll gems and npm dependencies', function (yargs) {
        presidium.install(conf);
    })
    .command('generate', 'Generate site sources', function (yargs) {
        presidium.generate(conf);
    })
    .command('build', 'Build site', function (yargs) {
        presidium.generate(conf);
        presidium.build(conf);
    })
    .command('validate', 'Validate generated site', function (yargs) {
        presidium.validate(conf)
    })
    .command('watch', 'Watch for content and media updates', function (yargs) {
        presidium.watch(conf)
    })
    .command('develop', 'Watch presidium sources (for development)', function (yargs) {
        presidium.develop(conf)
    })
    .command('serve', 'Serve site', function (yargs) {
        presidium.serve(conf);
    })
    .command('start', 'Build and serve', function (yargs) {
        presidium.clean(conf);
        presidium.generate(conf);
        presidium.watch(conf);
        presidium.serve(conf);
    })
    .command('gh-pages', 'Publish to Github Pages', function (yargs) {
        let version = yargs.argv['v'] || '';
        presidium.version(conf, version);
        presidium.clean(conf);
        presidium.generate(conf);
        presidium.build(conf, version);
        presidium.ghPages(conf, version);
    })
    .demand(1, 'must provide a valid command')
    .help('h').alias('h', 'help')
    .argv;

