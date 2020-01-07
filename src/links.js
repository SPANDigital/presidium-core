const fs = require('fs');
const cheerio = require('cheerio');
const colours = require('colors/safe');
const url = require('url');
const path = require('path');

let validPaths;
let htmlFiles;
let results;

//TODO: remove this:
let distSitePath = '';

const links = module.exports;
const mediaFolder = '/media';
const LEVELS = {
	ALL: 'all',
	VALID: 'valid',
	BROKEN: 'broken',
	WARNING: 'warning',
	EXTERNAL: 'external'
};

links.replaceInternalLinks = function(conf) {
	validPaths = new Set();
	htmlFiles = new Set();
	distSitePath = conf.distSitePath;
	traverseDirectory(distSitePath);

	getLinks(htmlFiles, (href, domElement, $, file) => {
		let baseUrlMatch = conf.baseUrl !== href;
		href = href.replace(conf.baseUrl, '/');
		if(href === '#') {
			domElement.replaceWith(() =>  domElement.contents());
		} else if (href !== '' && baseUrlMatch && href.indexOf('/') === 0) {
			href = href.replace(new RegExp('/', 'g'), '_');
			href = href.replace(new RegExp('#', 'g'), '_');
			domElement.attr('href', '#'+href);
		}
		fs.writeFile(file, $.root(), (err) => {
			if (err) {
				throw err;
			} 
		});
	});
};

links.validate = function(conf, argv) {
	validPaths = new Set();
	htmlFiles = new Set();
	results = {
		valid: 0,
		broken: 0,
		warning: 0,
		external: 0,
		total: 0
	};

	distSitePath = conf.distSitePath;
	traverseDirectory(distSitePath);
	validPaths.add('/');
	validPaths.add(path.join(conf.baseUrl, '/'));
	validateLinks(conf.baseUrl, argv);
	return results;
};

function traverseDirectory(dir) {
	fs.readdirSync(dir).forEach((file) => {
		file = path.join(dir, '/', file);

		const stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			validPaths.add(path.join(file.replace(distSitePath, '/'), '/'));
			traverseDirectory(file);
		} else {
			if (file.indexOf('.html') > -1) htmlFiles.add(file);
		}
	});
}

function getLinks(files, linkHandler) {
	let links = new Set();

	for (let file of files) {
		let $ = cheerio.load(fs.readFileSync(file));
		$('#presidium-content')
			.find('section a')
			.each(function(i, link) {
				let domElement = $(link);
				let href = domElement.attr('href');
				if (typeof href !== 'undefined') {
					// Checks if the href belongs to a set of assets (/media folder)
					if (href.indexOf(mediaFolder) > -1) {
						let parsedLink = url.parse(href);
						href = parsedLink.pathname; // Remove the hash from the URL
					}
					linkHandler(href, domElement, $, file);
					links.add(href);
				}
			});
	}
	return links;
}

function anchorValid(dir, anchorLink) {
	const link = url.parse(anchorLink);
	const file = path.join(link.path, '/');

	if (validPaths.has(file)) {
		let $ = cheerio.load(fs.readFileSync(dir + file + 'index.html'));

		return $('.anchor' + '[id="' + link.hash.slice(1) + '"]').length > 0;
	} else return false;
}

function log(type, baseLink, message = '', logLevel) {
	switch (type) {
	case LEVELS.BROKEN:
		results[LEVELS.BROKEN]++;
		if (!logLevel || logLevel === type || logLevel === LEVELS.ALL)
			console.log(colours.red('BROKEN:  \t' + colours.underline(baseLink)));
		break;
	case LEVELS.VALID:
		results[LEVELS.VALID]++;
		if (!logLevel || logLevel === type || logLevel === LEVELS.ALL)
			console.log(colours.blue('VALID:   \t' + colours.underline(baseLink)));
		break;
	case LEVELS.EXTERNAL:
		results[LEVELS.EXTERNAL]++;
		if (!logLevel || logLevel === type || logLevel === LEVELS.ALL)
			console.log(colours.grey('EXTERNAL:\t' + colours.underline(baseLink)));
		break;
	case LEVELS.WARNING:
		results[LEVELS.WARNING]++;
		if (!logLevel || logLevel === type || logLevel === LEVELS.ALL)
			console.log(colours.yellow('WARNING: \t' + colours.underline(baseLink) + '%s'), message);
		break;
	}
}

function validateLinks(baseUrl, argv) {
	let logLevel;
	if (argv) logLevel = argv.log;
	let links = getLinks(htmlFiles, (baseLink) => {
		let link = baseLink.replace(baseUrl, '/');
		if (link === '') {
			log(LEVELS.WARNING, baseLink, 'empty href defined', logLevel);
		} else if (baseUrl === baseLink) {
			log(LEVELS.VALID, baseLink, null, logLevel);
		} else if (link.indexOf('/') === 0) {
			if (link.indexOf('#') > -1) {
				if (anchorValid(distSitePath, link)) {
					if (link.indexOf('/#') > -1) {
						log(LEVELS.VALID, baseLink, null, logLevel);
					} else {
						log(LEVELS.WARNING, baseLink, ' is missing a trailing \'/\' before the \'#\'', logLevel);
					}
				} else {
					log(LEVELS.BROKEN, baseLink, null, logLevel);
				}
			} else {
				if (
					(link.lastIndexOf('/') === link.length - 1 && validPaths.has(link)) ||
					(link.lastIndexOf(mediaFolder) > -1 && fs.existsSync(distSitePath + link))
				) {
					log(LEVELS.VALID, baseLink, null, logLevel);
				} else {
					if (validPaths.has(link + '/')) {
						log(LEVELS.WARNING, baseLink, ' is missing a trailing \'/\'', logLevel);
					} else {
						log(LEVELS.BROKEN, baseLink, null, logLevel);
					}
				}
			}
		} else {
			log(LEVELS.EXTERNAL, baseLink, null, logLevel);
		}
	});

	results['total'] = links.size;
}

