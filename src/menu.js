var path = require('path');
var url = require('url');

const menu = module.exports;

menu.TYPE = {
    SECTION:  'section',
    CATEGORY: 'category',
    ARTICLE:  'article'
};

/**
 * Menu builder for traversing a menu tree. Appends items to the menu tree using the structure.
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
var MenuBuilder = function(config) {
    this.siteConfig = config;
    this.menu = {
        logo: this.siteConfig.logo,
        baseUrl: url.resolve(this.siteConfig.baseurl, "/"),
        roles: this.siteRoles(),
        children: []
    }
};

MenuBuilder.prototype.siteRoles = function() {
    return this.siteConfig.roles ?
    {
        label: this.siteConfig.roles.label,
        all: this.siteConfig.roles.all,
        options: this.siteConfig.roles.options
    } : {
        label: "",
        all: "",
        options: []
    }
};

MenuBuilder.prototype.addSection = function(props) {
    var section = {
        type: menu.TYPE.SECTION,
        id: props.path,
        title: props.title,
        level: 1,
        expandable: props.expandable? props.expandable : true,
        path: props.path,
        url: props.url,
        roles : [],
        children : []
    };
    this.menu.children.push(section);
    return section;
};

MenuBuilder.prototype.addCategory = function(parent, props) {
    var category = {
        type: menu.TYPE.CATEGORY,
        id: props.path,
        level: parent.level + 1,
        expandable: true,
        title: props.title,
        slug: props.slug,
        path: props.path,
        url: props.url,
        roles : [],
        parent: parent,
        children: [],
    };
    parent.children.push(category);
    return category;
};

MenuBuilder.prototype.addArticle = function(parent, props) {
    var article = {
        type: menu.TYPE.ARTICLE,
        id: props.id,
        path: props.path,
        url: props.url,
        slug: props.slug,
        title: props.title,
        parent: parent,
        level: parent.level + 1,
        expandable: false,
        roles: props.roles.length > 0 ? props.roles : [this.menu.roles.all]
    };
    parent.children.push(article);
    MenuBuilder.propagateRoles(article);
    return article;
};

/**
 * Traverses up all parent nodes in a tree and merges distinct roles.
 * @param node
 */
MenuBuilder.propagateRoles = function(node) {
    if (node.parent) {
        node.parent.roles = Array.from(new Set([...node.parent.roles, ...node.roles]));
        MenuBuilder.propagateRoles(node.parent);
    }
};

menu.builder = function(config) {
    return new MenuBuilder(config);
};
