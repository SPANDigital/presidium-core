var fs = require('fs-extra');
var path = require('path');
var structure = require('./structure');

const INDEX_TEMPLATE = 'index.html';

var pages = module.exports;

pages.generate = function(conf, structure) {
    console.log(`Writing pages to: ${conf.distSectionsPath}`);
    fs.emptydirSync(conf.distSectionsPath);

    structure.sections.map(section => {
        writeTemplate(conf, section);
        traverse(conf, section);
    });
};

function traverse(conf, section) {
    if (section.children) {
        section.children.map(child => {
            switch (child.type) {
                case structure.TYPE.CATEGORY :
                    writeTemplate(conf, child);
                    traverse(conf, child);
                    break;
                case structure.TYPE.ARTICLE:
                    //TODO article exports
                    break;
            }
        })
    }
}

function writeTemplate(conf, section) {
    if (section.articles.length == 0) {
        return;
    }
    const pageUrl = path.relative(conf.baseUrl, section.url);
    const pagePath = path.join(conf.distSectionsPath, pageUrl);
    const template = pageTemplate(conf, section);
    fs.mkdirsSync(pagePath);
    fs.writeFileSync(path.join(pagePath, INDEX_TEMPLATE), template);
}

function pageTemplate(conf, section) {
const permalink = path.join('/', path.relative(conf.baseUrl, section.url), '/');
return `---
title: ${section.title}
permalink: ${permalink}
layout: container
---
${includedArticles(conf, section)}`;
}

function includedArticles(conf, section) {
    return section.articles.map(article => {
        const articlePath = path.relative(conf.contentPath, article.path);
        return  `{% assign article = site.${ article.collection } | where:"path", "${ articlePath }"  | first %}\r\n` +
            `{% assign article-id = "${ article.id }" %}\r\n` +
            `{% assign article-title = "${ article.title }" %}\r\n` +
            `{% assign article-slug = "${ article.slug }" %}\r\n` +
            `{% assign article-url = "${ article.url }" %}\r\n` +
            `{% assign article-roles = "${ article.roles.join(',') }" %}\r\n` +
            `{% include article.html %}\r\n`;
    }).join('\r\n')
}