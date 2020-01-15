const structure = require('./structure');
const remark = require('remark');
const strip = require('strip-markdown');
const request = require('request');
const colours = require('colors/safe');
const linter = module.exports;

let results;

linter.validate = function(conf) {
	results = {
		missing_authors: 0
	};
	validateAuthor(conf);
	return results;
};

function validateAuthor(conf) {
	const struct = structure.generate(conf);
	new SiteStruct(conf, struct);
}

const SiteStruct = function(conf, structure) {
	this.stripper = remark().use(strip);
	structure.sections.map((section) => {
		traverse(section, this);
	});
};

SiteStruct.prototype.verifyAuthor = function(article) {
	if (article.author === undefined) {
		log(article.url, 'MISSING');
	} else {
		request(
			{
				url: 'https://api.github.com/users/' + article.author,
				headers: {
					'User-Agent': 'Awesome-Octocat-App'
				}
			},
			function(error, response) {
				if (response.statusCode !== 200) {
					log(`[${article.author}] - ${article.url}`, 'INVALID');
				}
			}
		);
	}
};

function traverse(node, map) {
	node.children.forEach((child) => {
		switch (child.type) {
			case structure.TYPE.CATEGORY:
				if (child.children.length > 0) {
					traverse(child, map);
				}
				break;
			case structure.TYPE.ARTICLE:
				map.verifyAuthor(child);
				break;
		}
	});
}

function log(baseLink, type) {
	results.missing_authors++;
	if (type === 'MISSING') {
		console.log(colours.red('MISSING AUTHOR: \t' + colours.underline(baseLink))); // eslint-disable-line
	} else if (type === 'INVALID') {
		console.log(colours.red('INVALID USER: \t' + colours.underline(baseLink))); // eslint-disable-line
	}
}
