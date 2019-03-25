const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;

let config = require('../src/config');
let links = require('../src/links');
let structure = require('../src/structure');

let presidium = require('../src/presidium');

let fs = require('fs-extra');

let assert = require('assert');

let res, conf;

describe('Link Validation', () => {
	describe('Build Site', () => {
		conf = config.load('./test/validation/_config.yml');
		fs.emptydirSync(conf.distSrcPath);
		presidium.clean(conf);
		presidium.generate(conf);

		//Set relative paths for jekyll build from ./test/.jekyll
		conf.distSrcPath = './validation/dist/src';
		conf.distSitePath = './validation/dist/site';
		presidium.build(conf);

		conf = config.load('./test/validation/_config.yml');
		res = links.validate(conf);
		st = structure.generate(conf);
	});

	it('Should find and validate links', () => {
		assert.equal(res.total, res.valid + res.broken + res.warning + res.external);
		assert.notEqual(res.total, 0);
	});

	it('Should indicate broken links', () => {
		assert.equal(res.broken, 5);
	});

	it('Should warn for uncertain links', () => {
		if (conf.baseUrl === '/') {
			assert.equal(res.warning, 2);
		} else {
			assert.equal(res.warning, 3);
		}
	});

	it('Should indicate valid links', () => {
		assert.equal(res.valid, 6);
	});

	it('Should indicate external links', () => {
		assert.equal(res.external, 1);
	});

	it('Should have collection set for external link section', () => {
		for (let section of st.sections) {
			if (section.title === "External Link") {
				assert.equal(section.collection, "External Link");
			}
			if (section.title === "Another External Link") {
				assert.equal(section.collection, "Another External Link");
			}
		}
	})
});
