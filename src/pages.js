const fs = require('fs-extra');
const path = require('path');
const structure = require('./structure');

const INDEX_TEMPLATE = 'index.html';
const ARTICLES_PER_PAGE_TEMPLATE = 'articles.json';

const pages = module.exports;

pages.articles = {};
pages.generate = function(conf, structure) {
	console.log(`Writing page templates: ${conf.distSectionsPath}`);
	fs.emptydirSync(conf.distSectionsPath);

	structure.sections.map((section) => {
		recordSectionArticles(section);
		writeTemplate(conf, section);
		traverse(conf, section);
	});

	const file = path.join(conf.distSrcPath, ARTICLES_PER_PAGE_TEMPLATE);
	fs.writeFileSync(file, JSON.stringify(pages.articles));
};

function traverse(conf, section) {
	if (section.children) {
		section.children.map((child) => {
			switch (child.type) {
			case structure.TYPE.CATEGORY:
				recordSectionArticles(child);
				writeTemplate(conf, child);
				traverse(conf, child);
				break;
			case structure.TYPE.ARTICLE:
				if (section.exportArticles) {
					exportContent(conf, section, child);
				}
				break;
			}
		});
	}
}

function recordSectionArticles(section) {
	if (section.articles.length === 0) {
		return;
	}

	const articleList = articleListTemplate(section);
	pages.articles[section.url] = articleList;
}

function articleListTemplate(section) {
	// generates an array of article urls for this section, used to lazy load articles on scroll
	return section.articles.map(article => {
		return path.join(article.parent.url, `${article.slug}.html`);
	});
}

function writeTemplate(conf, section) {
	if (section.articles.length === 0) {
		return;
	}
	const pageUrl = path.relative(conf.baseUrl, section.url);
	const pagePath = path.join(conf.distSectionsPath, pageUrl);
	const page = pageTemplate(conf, pageUrl, section);
	
	fs.mkdirsSync(pagePath);
	fs.writeFileSync(path.join(pagePath, INDEX_TEMPLATE), page);
}

function pageTemplate(conf, pageUrl, section) {
	// generates the template of the page containing all the articles in the section
	const permalink = path.join('/', pageUrl, '/');
	return `---
title: ${section.title}
permalink: ${permalink}
layout: container
section: ${section.url}
---
${includedArticles(conf, section)}`;
}

function includedArticles(conf, section) {
	return section.articles
		.slice(0,10) // Zelre: Make configurable
		.map((article) => {
			const articlePath = path.relative(conf.contentPath, article.path);
			return (
				`{% assign article = site.${
					article.collection
				} | where:"path", "${articlePath}"  | first %}\r\n` +
				`{% assign article-id = "${article.id}" %}\r\n` +
				`{% assign article-title = "${article.title}" %}\r\n` +
				`{% assign article-slug = "${article.slug}" %}\r\n` +
				`{% assign article-url = "${article.url}" %}\r\n` +
				`{% assign article-roles = "${article.roles.join(',')}" %}\r\n` +
				`{% assign article-scope = "${article.scope}" %}\r\n` +
				'{% include article.html %}\r\n'
			);
		})
		.join('\r\n');
}

function exportContent(conf, section, article) {
	const url = path.join(path.relative(conf.baseUrl, section.url), `${article.slug}.html`);
	const file = path.join(conf.distSectionsPath, url);
	fs.writeFileSync(file, contentTemplate(conf, article, url));
}

function contentTemplate(conf, article, url) {
	return `---
permalink: ${url}
layout: content
---
{% assign article = site.${article.collection} | where:"path", "${path.relative(
	conf.contentPath,
	article.path
)}"  | first %}\r\n`+
`{% assign article-id = "${article.id}" %}\r\n` +
`{% assign article-title = "${article.title}" %}\r\n` +
`{% assign article-slug = "${article.slug}" %}\r\n` +
`{% assign article-url = "${article.url}" %}\r\n` +
`{% assign article-roles = "${article.roles.join(',')}" %}\r\n` +
`{% assign article-scope = "${article.scope}" %}\r\n` +
'{% include article.html %}\r\n';
}


