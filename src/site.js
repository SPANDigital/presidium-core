const fs = require('fs');
const path = require('path');
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


site.traverse = function(conf, startingPath='') {
	let result = [];
	if (startingPath === '') {
		startingPath = conf.distSrcPath;
	}

	// list files in directory and loop through
	fs.readdirSync(startingPath).forEach((file) => {

		// builds full path of file
		const fPath = path.resolve(startingPath, file);

		if (path.extname(file) === '.md') {
			result.push(fPath);
		}
		else if (fs.statSync(fPath).isDirectory()) {
			// traverse further if file is a directory
			result = result.concat(site.traverse(conf, fPath));
		}
	});
	return result;
};
