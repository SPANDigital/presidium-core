const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;

let config = require('../src/config');
let presidium = require('../src/presidium');
let fs = require('fs');

let assert = require('assert');

describe('Install Dependencies (Build)', function() {
	let siteConfig = config.load('./test/build/_config.yml');

	describe('Install', function() {
		presidium.install(siteConfig);
	});

	it('Should Install Jekyll Gems', function() {
		if (!fs.existsSync('./test/.jekyll/Gemfile')) {
			assert.fail('Expected .jekyll/Gemfile');
		}
	});
});

describe('Install Dependencies (Scope)', function() {
	let siteConfig = config.load('./test/scope/_config.yml');

	describe('Install', function() {
		presidium.install(siteConfig);
	});

	it('Should Install Jekyll Gems', function() {
		if (!fs.existsSync('./test/.jekyll/Gemfile')) {
			assert.fail('Expected .jekyll/Gemfile');
		}
	});
});
