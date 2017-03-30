const fs = require('fs-extra');
const path = require('path');

const INDEX_TEMPLATE = "index.html";

const menu = require('./menu');
const parser = require('./parser');

const structure = module.exports;

/**
 * Traverses a content directory and builds a presidium site template
 * @param config jekyll site config
 * @param sections path to write template sections
 */
structure.build = function (config = "_config.yml", sections = "sections") {
    fs.emptydirSync(sections);
    const template = buildTemplate(config);

    template.pages.forEach(page => {
        writeTemplate(config, page, sections);
    });
};

function buildTemplate(config) {
    const site = {
        menu: menu.builder(config),
        pages: new Map()
    };

    const contentPath = config["content-path"] ? config["content-path"] : "content";

    config.structure.map(sectionConf => {
        const section = parser.parseSection(config, sectionConf);
        const sectionPath = path.join(contentPath, section.path);
        if (!fs.existsSync(sectionPath)) {
            throw new Error(`Expected site section content directory not found: '${sectionPath}'`);
        }

        const sectionPage = createPage(section.title, section.url, section.collection, section.articles);
        site.pages.set(section.url, sectionPage);

        const parent = site.menu.addSection(section);

        traverseSectionArticlesSync(contentPath, sectionPath, section.url, section.collection, site, parent);
    });

    console.log(require('util').inspect(site.menu, {depth : null}));
    return site;
}

function traverseSectionArticlesSync(contentPath, sectionPath, sectionUrl, collection, site, menuNode) {
    fs.readdirSync(sectionPath).map(file => {
        const filePath = path.join(sectionPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            const category = parser.parseCategory(contentPath, filePath, sectionUrl);

            const parentPage = site.pages.get(sectionUrl);
            parentPage.articles.push(createCategoryArticle(category));

            site.pages.set(category.url, createPage(category.title, category.url, collection, []));
            const categoryNode = site.menu.addCategory(menuNode, category);

            traverseSectionArticlesSync(contentPath, filePath, category.url, collection, site, categoryNode)
        } else {
            const article = parser.parseArticle(contentPath, filePath, sectionUrl);
            if (article.include) {
                site.pages.get(sectionUrl).articles.push(article);
                site.menu.addArticle(menuNode, article);
            }
        }
    });
}

function createPage(title, url, collection, articles = []) {
    return {
        title: title,
        url: url,
        collection: collection,
        articles: articles
    }
}

function createCategoryArticle(category) {
    return {
        title: category.title,
        path: category.path,
        isCategory: true
    }
}

function writeTemplate(config, page, destination) {
    const pageUrl = path.relative(config.baseurl, page.url);

    const pagePath = path.join(destination, pageUrl);
    const template = pageTemplate(pageUrl, page);
    fs.mkdirsSync(pagePath);
    fs.writeFileSync(path.join(pagePath, INDEX_TEMPLATE), template);
}

function pageTemplate(pageUrl, page) {

return `---
title: ${page.title}
permalink: ${pageUrl}
layout: container
---
{{page.title}}
${includedArticles(page)}`;
}

function includedArticles(page, collection) {
    if (page.articles.length <= 0) {
        return "{% include empty-article.html %}"
    } else {
        return page.articles.map(article => {
            return `{% assign article = site.${page.collection} | where:"path", "${article.path}"  | first %}` +
                (article.isCategory ? "{% include category.html %}" : "{% include article.html %}");
        }).join("\r\n")
    }
}
