var path = require('path');
var url = require('url');

const menu = module.exports;

menu.TYPE = {
    SECTION:  'section',
    CATEGORY: 'category',
    ARTICLE:  'article'
};

menu.init = function(config) {
    return new Menu(config);
};

/**
 * Builds a menu tree. Appends items to the menu tree using the structure.
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
 * @param config jekyll site config
 * @constructor
 */
var Menu = function(config) {
    this.logo = config.logo();
    this.brandName = config.brandName();
    this.baseUrl = config.baseUrl();
    this.roles =  this.siteRoles(config);
    this.children = [];
};

Menu.prototype.siteRoles = function(config) {
    return config.get('roles') ?
    {
        label: config.get('roles').label,
        all: config.get('roles').all,
        options: config.get('roles').options
    } : {
        label: '',
        all: '',
        options: []
    }
};

Menu.prototype.addSection = function(props) {
    var section = {
        type: menu.TYPE.SECTION,
        id: props.path,
        title: props.title,
        level: 1,
        collapsed: props.collapsed? props.collapsed: false,
        path: props.path,
        url: props.url,
        roles : [],
        children : []
    };
    this.children.push(section);
    return section;
};

Menu.prototype.addCategory = function(node, props) {
    var category = {
        type: menu.TYPE.CATEGORY,
        id: props.id,
        level: node.level + 1,
        collapsed: false,
        title: props.title,
        slug: props.slug,
        path: props.path,
        url: props.url,
        roles : [],
        parent: node,
        children: [],
    };
    node.children.push(category);
    return category;
};

Menu.prototype.addArticle = function(node, props) {
    var article = {
        type: menu.TYPE.ARTICLE,
        id: props.id,
        path: props.path,
        url: props.url,
        slug: props.slug,
        title: props.title,
        parent: node,
        level: node.level + 1,
        collapsed: true,
        roles: props.roles.length > 0 ? props.roles : [this.roles.all]
    };
    node.children.push(article);
    Menu.propagateRoles(article);
    return article;
};

/**
 * Visits all parent nodes in a tree and merge distinct roles.
 * @param node
 */
Menu.propagateRoles = function(node) {
    if (node.parent) {
        node.parent.roles = Array.from(new Set([...node.parent.roles, ...node.roles]));
        Menu.propagateRoles(node.parent);
    }
};