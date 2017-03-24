const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const fm = require('front-matter');

const structure = module.exports;

structure.traverseSync = function(dir) {
    var files = [];

    traverseDirectorySync(dir, files);
    return files;
};

function parseArticleSync(file) {
    const content = fs.readFileSync(file, { encoding: "utf8", flat: "r" });
    //May need to optimize once working on larger file sets
    return fm(content).attributes;
}

/**
 * Only export articles with valid frontmatter
 */
function exportArticle(article) {
    return Object.keys(article).length > 0;
}

function traverseDirectorySync(dir, files) {
    fs.readdirSync(dir).map(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectorySync(fullPath, files)
        } else {
            const header = parseArticleSync(fullPath);
            if  (exportArticle(header)) {
                files.push({
                    header: header,
                    file: {
                        name: file,
                        dir: dir,
                        path: fullPath
                    }
                })
            }
        }
    });
    return files;
}


structure.build = function(config = "_config.yml", source = "content", destination = "sections") {

    console.log(config);
    var siteConfig = loadConfig(config);

    siteConfig.structure.map(section => {
        const collectionPath = path.join(source, `_${section.collection}`);
        console.log(collectionPath);

        let articles = structure.traverseSync(collectionPath);
        let categories = new Set();

        articles.forEach(article => {
            const header = article.header;
            const category = header.category != undefined ? header.category : null;
            if (!categories.has(category)) {
                categories.add(category);
                buildPage(section, category, destination);
            }
        });
        console.log(articles.length);
    });
};

function buildPage(section, category, destination) {
    let pageTitle = section.title;
    let pagePath = section.path;
    let pageFile = path.join(destination, section.title);
    if (category) {
        const categories = category.split("/");
        pageTitle = categories[categories.length - 1];
        const categoryPath = categories.map(c => encodeURI(c.toLowerCase())).join("/");
        pagePath = path.join(section.path, categoryPath, "/");
        pageFile = path.join(destination, section.title);
    }

    const page = pageTemplate(pageTitle, pagePath, section, category);

    if (fs.existsSync(pageFile) === false) {
        fs.mkdirSync(pageFile, 0o777);
    }
    fs.writeFileSync(path.join(pageFile, `${pageTitle}.html`), page);
}

function pageTemplate(title, path, section, category) {
return `---
title: ${title}
permalink: ${path}
layout: container
---
{% for article in site.${section.collection} %}
    {% if article.category == ${category ? `'${category}'` : "nil"} %}
        {% include article.html %}
    {% endif %}
{% else %}
    {% include empty-article.html %}
{% endfor %}`;
}

function loadConfig(config = '_config.yml') {
    try {
        const file = fs.readFileSync(config, 'utf8');
        return yaml.load(file);
    } catch (e) {
        console.log(e);
    }
}