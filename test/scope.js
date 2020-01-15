const mocha = require('mocha');
const describe = mocha.describe;
const before = mocha.before;
const it = mocha.it;

let config = require('../src/config');
let presidium = require('../src/presidium');
let assert = require('assert');
let path = require('path');
let fs = require('fs-extra');

describe('Scope Validation', function() {
	this.timeout(0);
	let conf;
	const distSitePath = './test/scope/dist/site';
	const internal_category = path.join(
		distSitePath,
		'key-concepts',
		'scope-overview',
		'internal-scope'
	);
	const internal_section = path.join(distSitePath, 'internal-section');
	const external_category = path.join(
		distSitePath,
		'key-concepts',
		'scope-overview',
		'external-scope'
	);
	const both_category = path.join(distSitePath, 'both-section', 'internal-and-external');

	describe('Unspecified Scope', function() {
		before(function() {
			conf = config.load('./test/scope/_config.yml');
			presidium.clean(conf);
			presidium.generate(conf);
			conf.distSrcPath = './scope/dist/src';
			conf.distSitePath = './scope/dist/site';
			presidium.build(conf);
		});

		it('Should have both internal and external articles', function(done) {
			console.log('-----------'); // eslint-disable-line
			console.log(done); // eslint-disable-line
			fs.readdirSync(external_category, function(err, files) {
				if (!files || err) {
					assert.fail('Found no articles');
					done();
				}
				files.forEach(function(file) {
					fs.readFileSync(path.join(external_category, file), 'utf-8', function(
						err,
						content
					) {
						if (!content.includes('External Article')) {
							assert.fail('Found no external articles');
						}
						if (!content.includes('Internal Article')) {
							assert.fail('Found no internal articles');
						}
						if (!content.includes('No Scope')) {
							assert.fail('Found no articles with unspecified scope');
						}
					});
				});
			});
			done();
		});
	});

	describe('Internal Scope', function() {
		before(function() {
			conf = config.load('./test/scope/_config.yml');
			conf.scope = 'internal';
			presidium.clean(conf);
			presidium.generate(conf);
			conf.distSrcPath = './scope/dist/src';
			conf.distSitePath = './scope/dist/site';
			presidium.build(conf);
		});

		it('Should have no external articles in external-scope', function(done) {
			fs.readdirSync(external_category, function(err, files) {
				files.forEach(function(file) {
					fs.readFileSync(path.join(external_category, file), 'utf-8', function(
						err,
						content
					) {
						if (content.includes('External Article')) {
							assert.fail('Found an external article');
						}
						if (content.includes('No Scope')) {
							assert.fail('Found an article without scope');
						}
					});
				});
			});
			done();
		});

		it('Should inherit scope from a section if no scope on article', function(done) {
			fs.readdirSync(internal_section, function(err, files) {
				files.forEach(function(file) {
					fs.readFileSync(path.join(external_category, file), 'utf-8', function(
						err,
						content
					) {
						if (!content.includes('No Scope')) {
							assert.fail('Found no articles with unspecified scope');
						}
					});
				});
			});
			done();
		});
	});

	describe('External Scope', function() {
		before(function() {
			conf = config.load('./test/scope/_config.yml');
			conf.scope = 'external';
			presidium.clean(conf);
			presidium.generate(conf);
			conf.distSrcPath = './scope/dist/src';
			conf.distSitePath = './scope/dist/site';
			presidium.build(conf);
		});

		it('Should have no internal articles in external-scope', function(done) {
			fs.readdirSync(external_category, function(err, files) {
				files.forEach(function(file) {
					fs.readFile(path.join(external_category, file), 'utf-8', function(
						err,
						content
					) {
						if (content.includes('Internal Article')) {
							assert.fail('Found an internal article');
						}
						if (content.includes('No Scope')) {
							assert.fail('Found an article without scope');
						}
					});
				});
			});
			done();
		});

		it('Should remove the internal-scope folder', function(done) {
			fs.stat(internal_category, function(err) {
				if (!err || err.code !== 'ENOENT') {
					assert.fail('external-scope folder still exists');
				}
			});
			done();
		});

		it('Should remove the internal-section folder', function(done) {
			fs.stat(internal_section, function(err) {
				if (!err || err.code !== 'ENOENT') {
					assert.fail('internal-scope folder still exists');
				}
			});
			done();
		});
		it('Should find article with multiple scopes', function(done) {
			fs.stat(both_category, function(err) {
				if (err) {
					assert.fail('Article with multiple scopes not found');
				}
			});
			done();
		});
		it('Should find article inheriting multiple scopes', function(done) {
			fs.stat(both_category, function(err) {
				if (err) {
					assert.fail('Article did not inherit multiple scopes from section');
				}
			});
			done();
		});
	});
});
