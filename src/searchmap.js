const structure = require('./structure');
const remark = require('remark');
const strip = require('strip-markdown');
const path = require('path');
const fs = require('fs-extra');

const searchmap = module.exports;

searchmap.generate = function(conf, struct) {
	const map = new SearchMap(conf, struct);
	fs.mkdirsSync(conf.distSrcPath);
	const file = path.join(conf.distSrcPath, 'searchmap.json');
	console.log(`Writing search map: ${file}...`);
	fs.writeFileSync(file, JSON.stringify(map.articles));
};

const SearchMap = function(conf, structure) {
	this.stripper = remark().use(strip);
	this.articles = [];
	structure.sections.map((section) => {
		traverse(section, this);
	});
};

SearchMap.prototype.addArticle = function(article) {
	let stripped = String(this.stripper.processSync(article.content));

	// Clear the contents of any `if`, `for` and `comment` tags
	// Remove other tags but leave their contents
	const tagsRegExp = /{% if.*?endif %}|{% for.*?endfor %}|{% comment.*?endcomment %}|{%[^{}]*%}/gms;
	stripped = stripped.replace(tagsRegExp, '');

	this.articles.push({
		id: article.id,
		title: article.title,
		slug: article.slug,
		url: article.url,
		section: section(article),
		category: category(article),
		content: String(stripped),
		updated: new Date().toISOString(),
		roles: article.roles,
		scope: article.scope,
		author: article.author
	});
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
			map.addArticle(child);
			break;
		}
	});
}

function category(node) {
	return node.parent && node.parent.type === structure.TYPE.CATEGORY ? node.parent.title : '';
}

function section(node) {
	if (node.parent) {
		return node.parent.type === structure.TYPE.SECTION ? node.parent.title : section(node.parent);
	}
	return '';
}
