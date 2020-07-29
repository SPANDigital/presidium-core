#! /usr/bin/env node
const yargs = require('yargs');
const config = require('../src/config');
const presidium = require('../src/presidium');
const version = require('../src/version');

const scopeArg = {
	alias: 'scope',
	describe: 'Optional scope to include',
	choices: ['internal', 'external'],
	string: 'scope'
};

const argv = yargs
	.usage('$0 command')
	.command('requirements', 'Install jekyll gems and npm dependencies', function() {
		presidium.requirements(config.load());
	})
	.command('clean', 'Clean build directory', function() {
		presidium.clean(config.load());
	})
	.command('install', 'Install jekyll gems and npm dependencies', function() {
		presidium.install(config.load());
	})
	.command(
		'generate',
		'Generate site sources',
		function(yargs) {
			return yargs.option('s', scopeArg);
		},
		function(argv) {
			const conf = config.load();
			conf.scope = argv['s'];
			presidium.generate(conf);
		}
	)
	.command(
		'build',
		'Build site',
		function(yargs) {
			return yargs.option('s', scopeArg);
		},
		function(argv) {
			const conf = config.load();
			conf.scope = argv['s'];
			presidium.generate(conf);
			presidium.build(conf);
		}
	)
	.command(
		'buildV2',
		'Build site',
		function(yargs) {
			return yargs.option('s', scopeArg);
		},
		function(argv) {
			const conf = config.loadV2();
			conf.scope = argv['s'];
			presidium.buildV2(conf);
		}
	)
	.command(
		'validate',
		'Validate generated site',
		function(yargs) {
			return yargs.option('s', scopeArg);
		},
		function(argv) {
			const conf = config.load();
			conf.scope = argv['s'];
			presidium.clean(conf);
			presidium.generate(conf);
			presidium.build(conf);
			presidium.validate(conf);
		}
	)
	.command('watch', 'Watch for content and media updates', function() {
		presidium.watch(config.load());
	})
	.command('develop', 'Watch presidium sources (for development)', function() {
		presidium.develop(config.load());
	})
	.command('serve', 'Serve site', function() {
		presidium.serve(config.load());
	})
	.command(
		'start',
		'Build and serve',
		function(yargs) {
			return yargs.option('s', scopeArg);
		},
		function(argv) {
			const conf = config.load();
			conf.scope = argv['s'];
			presidium.clean(conf);
			presidium.generate(conf);
			version.islocal(conf);
			presidium.watch(conf);
			presidium.serve(conf);
		}
	)
	.command(
		'clean-gh-pages',
		'Remove old versions.',
		function(yargs) {
			return yargs.option('v', {
				alias: 'version',
				describe: 'Semantic version number you wish to delete.',
				demand: 'You must supply a version to delete.',
				string: 'version'
			});
		},
		function(argv) {
			version.clean(argv['v'], config.load('_config.yml'));
		}
	)
	.command(
		'gh-pages',
		'Publish to Github Pages',
		function(yargs) {
			return yargs
				.option('v', {
					alias: 'version',
					describe:
						'Semantic version number to publish with. \n If omitted, it defaults to publishing "latest".',
					string: 'version'
				})
				.option('s', scopeArg);
		},
		function(argv) {
			const conf = config.load(null, argv['v'] || '');
			conf.scope = argv['s'];
			presidium.clean(conf);
			presidium.generate(conf);
			version.init(conf);
			presidium.build(conf);
			presidium.ghPages(conf);
		}
	)
	.demand(1, 'must provide a valid command')
	.help('h')
	.alias('h', 'help').argv;

module.exports = argv;
