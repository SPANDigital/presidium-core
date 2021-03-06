const fs = require('fs-extra');
const path = require('path');
const structure = require('./structure');

const INDEX_TEMPLATE = 'index.html';

const pages = module.exports;

pages.generate = function(conf, structure) {
	console.log(`Writing page templates: ${conf.distSectionsPath}`);
	fs.emptydirSync(conf.distSectionsPath);

	structure.sections.map((section) => {
		writeTemplate(conf, section);
		traverse(conf, section);
	});
};

function traverse(conf, section) {
	if (section.children) {
		section.children.map((child) => {
			switch (child.type) {
			case structure.TYPE.CATEGORY:
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

function writeTemplate(conf, section) {
	if (section.articles.length === 0) {
		return;
	}
	const pageUrl = path.relative(conf.baseUrl, section.url);
	const pagePath = path.join(conf.distSectionsPath, pageUrl);
	const template = pageTemplate(conf, pageUrl, section);
	fs.mkdirsSync(pagePath);
	fs.writeFileSync(path.join(pagePath, INDEX_TEMPLATE), template);
}

function pageTemplate(conf, pageUrl, section) {
	const permalink = path.join('/', pageUrl, '/');
	return `---
title: ${section.title}
permalink: ${permalink}
layout: container
---
${includedArticles(conf, section)}`;
}

function includedArticles(conf, section) {
	return section.articles
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
)}"  | first %}\r\n
{{article.content}}\r\n`;
}
