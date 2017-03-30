const fs = require('fs-extra');
const path = require('path');
const menu = require('./menu');
const parser = require('./parser');

const INDEX_TEMPLATE = "index.html";

const structure = module.exports;

/**
 * Traverses a content directory and builds a presidium site template sections
 * @param config jekyll site config
 * @param sections path to write template sections
 */
structure.build = function (config = "_config.yml") {

    //TODO move defauts to config parser
    const includesPath = config['include-path'] ? config['include-path'] : "_includes";
    const sectionsPath = config['section-path'] ? config['section-path'] : "sections";

    fs.emptydirSync(sectionsPath);
    const template = buildTemplate(config);

    fs.mkdirsSync(includesPath);
    writeMenu(template.menu, path.join(includesPath, "menu1.json"));

    template.pages.forEach(page => {
        writeTemplate(config, page, sectionsPath);
    });
};

function buildTemplate(config) {
    const site = {
        menu: menu.init(config),
        pages: new Map()
    };

    const contentPath = config["content-path"] ? config["content-path"] : "content";

    config.sections.map(sectionConf => {
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

    console.log(require('util').inspect(site.menu, {depth: null}));

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
        slug: category.slug,
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

function writeMenu(menu, destination) {
    const json = JSON.stringify(menu, (key, value)=> {
        //Ignore circular parent references
        return (key == "parent") ? undefined : value;
    });
    fs.writeFileSync(destination, json);
}

function pageTemplate(pageUrl, page) {

    return `---
title: ${page.title}
permalink: /${pageUrl}/
layout: container
---
${includedArticles(page)}`;
}

function includedArticles(page, collection) {
    if (page.articles.length <= 0) {
        return "{% include empty-article.html %}"
    } else {
        return page.articles.map(article => {
            return  `{% assign article = site.${ page.collection } | where:"path", "${ article.path }"  | first %}` +
                    `{% assign slug = "${ article.slug }" %}` +
                (article.isCategory ? "{% include category.html %}" : "{% include article.html %}");
        }).join("\r\n")
    }
}
