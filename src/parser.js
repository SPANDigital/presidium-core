const fs = require('fs-extra');
const path = require('path');
const fm = require('front-matter');
const slugify = require('slugify');

const INDEX_SOURCE = "index.md";
const IGNORE_ARTICLE = {include: false};

const parser = module.exports;

parser.parseSection = function (siteConf, sectionConf) {
    return {
        title: sectionConf.title,
        path: path.join(`_${sectionConf.collection}`, "/"),
        url: path.join(siteConf.baseurl, sectionConf.path),
        collection: sectionConf.collection,
        articles: []
    }
};

parser.parseCategory = function (basePath, filePath, sectionUrl) {

    const index = path.join(filePath, INDEX_SOURCE);

    let categoryTitle = path.parse(filePath).name;
    let categoryPath = path.relative(basePath, filePath);

    if (fs.existsSync(index)) {
        const content = fs.readFileSync(index, {encoding: "utf8", flat: "r"});
        const attributes = fm(content).attributes;
        if (attributes && attributes.title) {
            categoryTitle = attributes.title;
        } else {
            throw new Error("A title is required in a category index.")
        }
    }

    const slug = slugify(categoryTitle.toLowerCase());
    return {
        title: categoryTitle,
        path: path.join(categoryPath, "/"),
        slug: slug,
        url: path.join(sectionUrl, slug, "/")
    }
};

parser.parseArticle = function (basePath, filePath, sectionUrl) {
    const file = path.parse(filePath).base;
    if (file == INDEX_SOURCE) {
        return IGNORE_ARTICLE;
    }

    //May need to optimize once working on larger file sets
    const content = fs.readFileSync(filePath, {encoding: "utf8", flat: "r"});
    const attributes = fm(content).attributes;

    if (attributes && attributes.title) {
        const slug = slugify(attributes.title.toLowerCase());
        const articlePath = path.relative(basePath, filePath);
        return {
            id: articlePath,
            title: attributes.title,
            roles: parser.parseRoles(attributes.roles),
            path: articlePath,
            url: path.join(sectionUrl, `#${slug}`),
            slug: slug,
            include: true
        };
    }
    return IGNORE_ARTICLE;
};

parser.parseRoles = function (roles) {
    if (roles && roles.constructor === Array) {
        return roles;
    }
    return roles ? [roles] : [];
};
