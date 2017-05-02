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
    const destination = path.join(conf.distIncludesPath, MENU_STRUCTURE);
    fs.writeFileSync(destination, JSON.stringify(siteMenu));
};


var Menu = function(conf, structure) {
    this.logo = conf.logo;
    this.brandName = conf.brandName;
    this.baseUrl = conf.baseUrl;
    this.roles =  conf.roles;
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
        path: props.path,
        url: props.url,
        roles : props.roles,
        children : []
    };
    node.children.push(section);
    traverse(section, props.children);
}

function traverse(node, children) {
    children.forEach(child => {
        switch(child.type) {
            case structure.TYPE.CATEGORY:
                if (child.children.length > 0) {
                    const category = addCategory(node, child);
                    traverse(category, child.children);
                }
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
        roles : props.roles,
        children: [],
    };
    node.children.push(category);
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
        roles: props.roles
    };
    node.children.push(article);
}