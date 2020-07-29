const structure = require('./structure');
const menu = require('./menu');
const pages = require('./pages');
const searchmap = require('./searchmap');

const site = module.exports;

site.generate = function(conf) {
	const struct = structure.generate(conf);
	menu.generate(conf, struct);
	pages.generate(conf, struct);
	searchmap.generate(conf, struct);
};

site.generateV2 = function(conf) {
	const struct = structure.generateV2(conf);
	menu.generateV2(conf, struct);
	pages.generate(conf, struct);
	searchmap.generate(conf, struct);
};
