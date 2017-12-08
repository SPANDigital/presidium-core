var fs = require('fs-extra');
var path = require('path');
var fm = require('front-matter');
var slug = require('slug');
var structure = require('./structure');

const INDEX_SOURCE = 'index.md';
const IGNORED_ARTICLE = { include: false };

var parse = module.exports;

parse.slug = function(value) {
    return slug(value, { mode: 'rfc3986' });
};

parse.section = function (conf, section) {
    const sectionUrl = path.join(conf.baseUrl, section.url);
    const sectionPath = path.join(conf.contentPath, `_${section.collection}`, '/');

    return {
        id: sectionPath,
        type: structure.TYPE.SECTION,
        title: section.title,
        path: sectionPath,
        url: sectionUrl,
        collection: section.collection,
        collapsed: section.collapsed || false,
        exportArticles: section['export-articles'] || false,
        roles: [],
        articles: [],
        children: []
    }
};

parse.category = function (section, file) {
    const indexFile = path.join(file, INDEX_SOURCE);
    let title = path.parse(file).name;

    if (fs.existsSync(indexFile)) {
        const content = fs.readFileSync(indexFile, {encoding: 'utf8', flat: 'r'});
        const attributes = fm(content).attributes;
        if (attributes && attributes.title) {
            title = attributes.title;
        } else {
            throw new Error('A title is required in a category index.')
        }
    }

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
        roles: [],
        articles: [],
        children: []
    }
};

parse.article = function (conf, section, file) {
    const filename = path.parse(file).base;
    if (filename == INDEX_SOURCE) {
        return IGNORED_ARTICLE;
    }

    //Review with larger file sets
    const content = fs.readFileSync(file, { encoding: 'utf8', flat: 'r' });
    const article = fm(content);
    const attributes = article.attributes;

    if (attributes && attributes.title) {
        const slug = parse.slug(attributes.title);
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
