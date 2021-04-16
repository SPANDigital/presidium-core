const mocha = require('mocha');
const describe = mocha.describe;
const before = mocha.before;
const it = mocha.it;

const config = require('../src/config');
const presidium = require('../src/presidium');
let assert = require('assert');
let path = require('path');
let fs = require('fs-extra');

describe('Menu', function() {
	this.timeout(0);
	let conf;
	const distSitePath = './test/menu/dist/site';
	const distSrcPath = './test/menu/dist/src';

	describe('Menu.json', function() {
		before(function() {
			conf = config.load('./test/menu/_config.yml');
			presidium.clean(conf);
			presidium.generate(conf);
			conf.distSrcPath = './menu/dist/src';
			conf.distSitePath = './menu/dist/site';
			presidium.build(conf);
		});

		it('Generated files contain alwaysOpen for menu load', function(done) {
			const filePath = path.join(distSitePath, 'media/js/init.js');
			if(!fs.existsSync(filePath)) {
				assert.fail('init.js file does not exist in key concepts diretory');
				done();
			}
			const file = fs.readFileSync(filePath);
			if (!file.includes('"alwaysExpanded":true')) {
				assert.fail('Found no sections with alwaysExpanded set to true');
				done();
			}
			done();
		});

		it('Menu.json has alwaysOpen set correctly', function(done) {
			const menuJsonPath = path.join(
				distSrcPath,
				'_includes'
			);
			const filePath = path.join(menuJsonPath, 'menu.json');
			if(!fs.existsSync(filePath)) {
				assert.fail('menu.json file does not exist');
				done();
			}
			const rawData = fs.readFileSync(filePath);
			let menuData = JSON.parse(rawData);
			if (!menuData) {
				assert.fail('Unable to parse json data from menu.json');
				done();
			}
			if (menuData.children ){
				menuData.children.forEach(value => {
					if (value.title === 'Key Concepts') {
						assert.equal(value.alwaysExpanded, false);
					}
					if (value.title === 'Internal Section') {
						assert.equal(value.alwaysExpanded, true);
					}
				});
			}
			done();
		});
	});
});
