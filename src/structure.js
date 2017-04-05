const fs = require('fs-extra');
const path = require('path');
const menu = require('./menu');
const parser = require('./parser');

const INDEX_TEMPLATE = 'index.html';
const MENU_STRUCTURE = 'menu.json';

const structure = module.exports;

const PAGE_TYPE = {
    SECTION: 'section',
    CATEGORY: 'category',
};

/**
 * Traverses a content directory and builds a presidium site template sections
 * @param config jekyll site config
 */
structure.build = function (config) {

    console.log(`Generating sections in: ${config.distSections()}`);

    fs.emptydirSync(config.distSections());
    const template = buildTemplate(config);

    fs.mkdirsSync(config.distIncludes());
    writeMenu(template.menu, path.join(config.distIncludes(), MENU_STRUCTURE));

    template.pages.forEach(page => {
        writeTemplate(config, page, config.distSections());
    });
};

function buildTemplate(config) {
    const site = {
        menu: menu.init(config),
        pages: new Map()
    };

    const contentPath = config.get('content-path', 'content');

    config.get('sections').map(sectionConf => {
        const section = parser.parseSection(config, sectionConf);
        const sectionPath = path.join(contentPath, section.path);
        if (!fs.existsSync(sectionPath)) {
            throw new Error(`Expected site section content directory not found: '${sectionPath}'`);
        }

        const sectionPage = createPage(section, PAGE_TYPE.SECTION, section.collection);
        site.pages.set(section.url, sectionPage);

        const parent = site.menu.addSection(section);

        traverseSectionArticlesSync(contentPath, sectionPath, section.url, section.collection, site, parent);
    });

    // console.log(require('util').inspect(siteConfig.menu, {depth: null}));

    return site;
}

function traverseSectionArticlesSync(contentPath, sectionPath, sectionUrl, collection, site, menuNode) {
    fs.readdirSync(sectionPath).map(file => {
        const filePath = path.join(sectionPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            const category = parser.parseCategory(contentPath, filePath, sectionUrl, collection);

            const parentPage = site.pages.get(sectionUrl);
            const categoryPage = createPage(category, PAGE_TYPE.CATEGORY);

            parentPage.articles.push(categoryPage);

            site.pages.set(categoryPage.url, categoryPage);
            const categoryNode = site.menu.addCategory(menuNode, category);

            traverseSectionArticlesSync(contentPath, filePath, category.url, collection, site, categoryNode)
        } else {
            const article = parser.parseArticle(contentPath, filePath, sectionUrl);
            if (article.include) {
                const page = site.pages.get(sectionUrl);
                page.articles.push(article);
                page.roles = Array.from(new Set([...page.roles, ...article.roles]));

                site.menu.addArticle(menuNode, article);
            }
        }
    });
}

function createPage(item, type) {
    return {
        type: type,
        id: item.id,
        title: item.title,
        path: item.path,
        url: item.url,
        slug: item.slug,
        collection: item.collection,
        roles: [],
        articles: []
    }
}

function writeTemplate(config, page, destination) {
    const pageUrl = path.relative(config.get('baseurl'), page.url);

    const pagePath = path.join(destination, pageUrl);
    const template = pageTemplate(pageUrl, page, config.get('roles')? config.get('roles').all : '');
    fs.mkdirsSync(pagePath);
    fs.writeFileSync(path.join(pagePath, INDEX_TEMPLATE), template);
}

function writeMenu(menu, destination) {
    const json = JSON.stringify(menu, (key, value)=> {
        //Ignore circular parent references
        return (key == 'parent') ? undefined : value;
    });
    fs.writeFileSync(destination, json);
}

function pageTemplate(pageUrl, page, defaultRole) {

return `---
title: ${page.title}
permalink: /${pageUrl}/
layout: container
---
${includedArticles(page, defaultRole)}`;
}

function includedArticles(page, defaultRole) {
    if (page.articles.length <= 0) {
        return '{% include empty-article.html %}'
    } else {
        return page.articles.map(article => {
            return  `{% assign article = site.${ page.collection } | where:"path", "${ article.path }"  | first %}\r\n` +
                    `{% assign article-id = "${ article.id }" %}\r\n` +
                    `{% assign article-title = "${ article.title }" %}\r\n` +
                    `{% assign article-slug = "${ article.slug }" %}\r\n` +
                    `{% assign article-url = "${ article.url }" %}\r\n` +
                    `{% assign article-roles = "${ article.roles.length > 0 ? article.roles.join(',') : [defaultRole] }" %}\r\n` +
                    (article.type == PAGE_TYPE.CATEGORY ? '{% include category.html %}\r\n' : '{% include article.html %}\r\n');
        }).join('\r\n')
    }
}
