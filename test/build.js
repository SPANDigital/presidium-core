const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;

let config = require('../src/config');
let presidium = require('../src/presidium');

let assert = require('assert');

let fs = require('fs-extra');

describe('Build Site', function() {
	let conf;
	const distSrcPath = './test/build/dist/src';
	const distSitePath = './test/build/dist/site';

	describe('Clean', function() {
		conf = config.load('./test/build/_config.yml');
		presidium.clean(conf);
	});

	it('Should clean dist site', () => {
		fs.readdirSync(conf.distPath, (err, files) => {
			if (files.length && files.length > 0) {
				assert.fail('Should have cleaned up');
			}
		});
	});

	describe('Generate', function() {
		conf = config.load('./test/build/_config.yml');
		presidium.generate(conf);
	});

	it('Should generate dist src', () => {
		fs.readdirSync(distSrcPath, (err, files) => {
			if (!files.length) {
				assert.fail('Should have created dist src files');
			}
		});
	});

	describe('Build', function() {
		conf = config.load('./test/build/_config.yml');
		//Relative to .jekyll
		conf.distSrcPath = './build/dist/src';
		conf.distSitePath = './build/dist/site';
		presidium.build(conf);
	});

	it('Should generate dist site', () => {
		fs.readdirSync(distSitePath, (err, files) => {
			if (!files.length) {
				assert.fail('Should have created dist site');
			}
		});
	});
});
