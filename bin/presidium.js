#! /usr/bin/env node

var yargs = require('yargs');
var config = require('../src/config');
var presidium = require('../src/presidium');
var version = require('../src/version');
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
    .command('clean-gh-pages', 'Remove old versions.', function (yargs) {
        return yargs.alias('v', 'version')
            .describe('v', 'Semantic version number you wish to delete.')
            .demand('v', 'You must supply a version to delete.')
            .string('v');
    }, function (argv) {
        version.clean(argv['v'], conf);
    })
    .command('gh-pages', 'Publish to Github Pages', function (yargs) {
        return yargs.alias('v', 'version')
            .describe('v', 'Semantic version number to publish with. \n If omitted, it defaults to publishing "latest".')
            .string('v');
    }, function (argv) {
        conf = config.load('_config.yml', yargs.argv['v'] || '');
        presidium.clean(conf);
        presidium.generate(conf);
        version.init(conf);
        presidium.build(conf);
        presidium.ghPages(conf);
    })
    .demand(1, 'must provide a valid command')
    .help('h').alias('h', 'help')
    .argv;