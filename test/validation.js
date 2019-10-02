const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;

const parse = require('../src/parse');
let config = require('../src/config');
let links = require('../src/links');
let structure = require('../src/structure');

let presidium = require('../src/presidium');

let fs = require('fs-extra');

let assert = require('assert');

let res, conf, st;

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

	describe('Testing Structure', function() {
		st.sections.forEach(section => {
			let groupedArticles = section.articles.reduce((x, article) => {
				if(article.parent.id) {
					x[article.parent.id] = x[article.parent.id] || [];
					x[article.parent.id].push(article);
				}
				return x;
			}, {});

			Object.keys(groupedArticles).forEach(child => {
				let childrenPaths = groupedArticles[child].map(x => x.path);
				let indexPath = child + '/' + parse.INDEX_SOURCE;

				it('Should have index as first article if exists', () => {
					if(childrenPaths.includes(indexPath)) {
						assert.equal(childrenPaths[0], indexPath);
					}
				});
				it('Should be sorted (Excluding index)', () => {
					if(childrenPaths.includes(indexPath)) childrenPaths.shift();
					let sorted = childrenPaths.length === 1;
					for(let j = 0 ; j < childrenPaths.length - 1 ; j++){
						if(childrenPaths[j] > childrenPaths[j+1]) {
							sorted = false;
							break;
						}
					}
					assert.equal(sorted, true);
				});
			});
		});
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
			if (section.title === 'External Link') {
				assert.equal(section.collection, 'External Link');
			}
			if (section.title === 'Another External Link') {
				assert.equal(section.collection, 'Another External Link');
			}
		}
	});
});
