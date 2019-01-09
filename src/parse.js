const fs = require('fs-extra');
const path = require('path');
const fm = require('front-matter');
const slug = require('slug');
const structure = require('./structure');

const IGNORED_ARTICLE = { include: false };

const parse = module.exports;

parse.INDEX_SOURCE = 'index.md';

parse.slug = function(value) {
	return slug(value, { mode: 'rfc3986' });
};

parse.section = function (conf, section) {

	let sectionUrl;
	let newTab;

	if (section['external-url'] !== undefined) {
		sectionUrl = section['external-url'].href;
		newTab = section['external-url']['new-tab'] !== undefined ? section['external-url']['new-tab'] : true;
	} else {
		sectionUrl = path.join(conf.baseUrl, section.url);
		newTab = false;
	}

	const sectionPath = path.join(conf.contentPath, `_${section.collection}`, '/');

	return {
		id: sectionPath,
		type: structure.TYPE.SECTION,
		title: section.title,
		path: sectionPath,
		url: sectionUrl,
		collection: section.collection,
		collapsed: section.collapsed || false,
		newTab: newTab,
		exportArticles: section['export-articles'] || false,
		scope: parse.scope(section.scope),
		roles: [],
		articles: [],
		children: []
	};
};

parse.category = function (section, file) {
	const indexFile = path.join(file, parse.INDEX_SOURCE);
	let title = path.parse(file).name;
	let scope = section.scope;
	if (fs.existsSync(indexFile)) {
		const content = fs.readFileSync(indexFile, {encoding: 'utf8', flat: 'r'});
		const attributes = fm(content).attributes;
		if (attributes && attributes.title) {
			title = attributes.title;
		} else {
			throw new Error('A title is required in a category index.');
		}
		scope = attributes.scope ? attributes.scope : scope;
	}
	scope = parse.scope(scope);

	const slug = parse.slug(title);
	return {
		id: file,
		type: structure.TYPE.CATEGORY,
		title: title,
		slug: slug,
		path: file,
		url: path.join(section.url, slug, '/'),
		parent: section,
		exportArticles: section.exportArticles,
		collection: section.collection,
		scope: scope,
		roles: [],
		articles: [],
		children: []
	};
};

parse.article = function (conf, section, file) {
	const filename = path.parse(file).base;

	//Review with larger file sets
	const content = fs.readFileSync(file, { encoding: 'utf8', flat: 'r' });
	const article = fm(content);
	const attributes = article.attributes;
	article.scope = attributes.scope ? attributes.scope : section.scope;
	article.scope = parse.scope(article.scope);

	if (conf.scope && !article.scope.includes(conf.scope)) {
		return IGNORED_ARTICLE;
	}

	if (attributes && attributes.title) {
		let slug = parse.slug(attributes.title);
		if (filename === parse.INDEX_SOURCE) {
			slug = '';
		}
		return {
			id: file,
			type: structure.TYPE.ARTICLE,
			title: attributes.title,
			content: article.body,
			slug: slug,
			path: file,
			url: path.join(section.url, `#${slug}`),
			parent: section,
			collection: section.collection,
			roles: parse.roles(conf, attributes.roles),
			author: attributes.author,
			scope: article.scope,
			include: true,
		};
	}
	return IGNORED_ARTICLE;
};

parse.roles = function (conf, roles) {
	const all = conf.roles.all ? [conf.roles.all] : [];

	if (roles && roles.constructor === Array) {
		return roles.length > 0 && conf.showRoles ? roles : all;
	}
	return roles && conf.showRoles ? [roles] : all;
};

parse.scope = function(scope) {
	if (scope && scope.constructor === Array)
		return scope;
	if (scope === undefined || scope === [])
		return [];
	return [scope];
};
