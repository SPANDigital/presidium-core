const yaml = require('js-yaml');
const fs = require('fs-extra');
const path = require('path');
const fm = require('front-matter');

const structure = module.exports;

const INDEX_SOURCE = "index.md";
const INDEX_TEMPLATE = "index.html";
const IGNORE_ARTICLE = {include : false};

structure.build = function(config = "_config.yml", source = "content", destination = "sections") {

    console.log(`Deleting section templates in: ${destination}`);
    fs.emptydirSync(destination);

    const menu = siteMenu(config);

    config.structure.map(section => {
        const structure = traverseSync(source, section, menu);

        structure.pages.forEach(page => {
            writeTemplate(section.collection, page, destination);
        });

        menu.structure.concat(structure.items)
    });

    console.log(JSON.stringify(menu.structure));
};


function traverseSync(basePath, section, menu) {
    const contentPath = path.join(basePath, `_${section.collection}`);
    const url = path.join(section.path, "/");

    console.log(`Processing articles in collection: ${contentPath}`);

    var pages = new Map();

    menu.structure.push({
        type: "section",
        title: section.title,
        path: path.join(menu.baseUrl, url),
        expandable: section.expandable? section.expandable : true,

    });
    pages.set(url, createPage(section.title, url, []));
    traverseArticlesSync(basePath, contentPath, url, pages);
    return {
        pages: pages
    };
}

function traverseArticlesSync(basePath, contentPath, url, pages) {

    fs.readdirSync(contentPath).map(file => {

        const filePath = path.join(contentPath, file);
        if (fs.statSync(filePath).isDirectory()) {

            const category = parseCategory(basePath, filePath);
            //Add category pointer to parent page
            pages.get(url).articles.push(category);

            //Create new page and traverse children
            const subUrl = path.join(url, encodeURI(category.title.toLowerCase().replace(/ /g, '-')), "/");
            pages.set(subUrl, createPage(category.title, subUrl, []));
            traverseArticlesSync(basePath, filePath, subUrl, pages)

        } else {
            const article = parseArticle(basePath, filePath);
            if (!article.include) {
                return;
            }
            pages.get(url).articles.push(article);
        }
    });
    return pages;
}

function parseCategory(basePath, directoryPath) {

    const index = path.join(directoryPath, INDEX_SOURCE);
    if (fs.existsSync(index)) {
        const content = fs.readFileSync(index, { encoding: "utf8", flat: "r" });
        const attributes = fm(content).attributes;
        if (attributes && attributes.title) {
            return {
                title: attributes.title,
                path: path.relative(basePath, index),
                isCategory: true
            }
        } else {
            throw new Error("A title is required in a category index.")
        }
    } else {
        //Default to directory name if no index is provided...
        return {
            title: path.parse(directoryPath).name,
            path: path.relative(basePath, directoryPath),
            isCategory: true
        }
    }
}

function createPage(title, url, articles) {
    return {
        title: title,
        url: url,
        articles: articles
    }
}

function parseArticle(basePath, filePath) {
    const file = path.parse(filePath).base;
    if (file == INDEX_SOURCE) {
        return IGNORE_ARTICLE;
    }

    //May need to optimize once working on larger file sets
    const content = fs.readFileSync(filePath, { encoding: "utf8", flat: "r" });
    const attributes = fm(content).attributes;

    if (attributes && attributes.title) {
        return {
            include: true,
            title: attributes.title,
            path: path.relative(basePath, filePath)
        };
    }
    return IGNORE_ARTICLE;
}

function writeTemplate(collection, page, destination) {
    const pagePath = path.join(destination, page.url);
    const template = pageTemplate(collection, page);
    fs.mkdirsSync(pagePath);
    fs.writeFileSync(path.join(pagePath, INDEX_TEMPLATE), template);
}

function pageTemplate(collection, page) {
    console.log(`Generating page template: ${JSON.stringify(page)}`);

return `---
title: ${page.title}
permalink: ${page.url}
layout: container
---
${includedArticles(collection, page)}`;
}

function includedArticles(collection, page) {
    if (page.articles.length <= 0) {
        return "{% include empty-article.html %}"
    } else {
        return page.articles.map(article => {
            return `{% assign article = site.${collection} | where:"path", "${article.path}"  | first %}` +
                (article.isCategory ? "{% include category.html %}" : "{% include article.html %}");
        }).join("\r\n")
    }
}



function rolesMenu(config) {
        return config.roles ?
        {
            label: config.roles.label,
            all: config.roles.all,
            options: config.roles.options
        } : {
            label: "",
            all: "",
            options: []
    }
}
function siteMenu(config) {

    return {
        logo: config.logo,
        baseUrl: path.join(config.baseurl, "/"),
        roles: rolesMenu(config),
        structure : []
    };
    console.log(`Menu: ${JSON.stringify(menu)}`);

    // {
    //     logo : "media/images/logo.png",
    //         brandName : "Presidium",
    //     baseUrl :   "/presidium/" ,
    //     currentPage : "/presidium/key-concepts/structure/",
    //     roles: {
    //     label: "Show documentation for",
    //         all: "All Roles",
    //         options: ["Business Analyst","Developer","Tester"]
    //
    // },
    //     structure : [ {
    //
    //
    //         "title" : "Overview",
    //         "slug" : "overview",
    //         "path" : "/presidium/",
    //         "collection" : "overview",
    //         "expandable" : false,
    //         "articles" : [
    //             {
    //
    //                 "id": "/overview/index",
    //                 "title" : "Overview",
    //                 "path" : "/presidium/#overview",
    //                 "slug" : "#overview",
    //                 "category": "",
    //                 "roles":  []
    //             }
    //         ]},
}