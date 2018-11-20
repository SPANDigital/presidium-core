var fs = require('fs-extra');
var path = require('path');
var structure = require('./structure');

var menu = module.exports;

const MENU_STRUCTURE = 'menu.json';

/**
 * Generate and writes menu.json
 *
 * Sections are root nodes than may have articles and categories
 * Categories group articles
 * Articles are leaf nodes
 *
 * - section
 *   - article
 *   - category
 *     - article
 *     - category
 *       - ...
 *
 * @param conf site config
 * @param structure site structure
 */
menu.generate = function(conf, structure) {

    fs.mkdirsSync(conf.distIncludesPath);
    const siteMenu = new Menu(conf, structure);
    const file = path.join(conf.distIncludesPath, MENU_STRUCTURE);
    console.log(`Writing menu: ${file}...`);
    fs.writeFileSync(file, JSON.stringify(siteMenu));
};


var Menu = function(conf, structure) {
    this.logo = conf.logo;
    this.brandName = conf.brandName;
    this.brandUrl = conf.brandUrl;
    this.baseUrl = conf.baseUrl;
    this.roles =  conf.roles;
    this.scope = conf.scope;
    this.children = [];
    structure.sections.map(section => {
        addSection(this, section);
    })
};

function addSection(node, props) {
    var section = {
        type: structure.TYPE.SECTION,
        id: props.path,
        title: props.title,
        level: 1,
        collapsed: props.collapsed,
        newTab: props.newTab,
        path: props.path,
        url: props.url,
        roles: props.roles,
        scope: props.scope,
        children : []
    };
    traverse(section, props.children);
    if (section.children.length > 0 || section.url.startsWith("http")) {
        node.children.push(section);
    }
}

function traverse(node, children) {
    children.forEach(child => {
        switch(child.type) {
            case structure.TYPE.CATEGORY:
                addCategory(node, child);
                break;
            case structure.TYPE.ARTICLE:
                addArticle(node, child);
                break;
        }
    })
}

function addCategory(node, props) {
    var category = {
        type: structure.TYPE.CATEGORY,
        id: props.id,
        level: node.level + 1,
        collapsed: false,
        title: props.title,
        slug: props.slug,
        path: props.path,
        url: props.url,
        roles: props.roles,
        scope: props.scope,
        children: [],
    };
    traverse(category, props.children);
    if (category.children.length > 0) {
        node.children.push(category);
    }
    return category;
}

function addArticle(node, props) {
    var article = {
        type: structure.TYPE.ARTICLE,
        id: props.id,
        path: props.path,
        url: props.url,
        slug: props.slug,
        title: props.title,
        level: node.level + 1,
        collapsed: true,
        roles: props.roles,
        scope: props.scope,
    };
    node.children.push(article);
}