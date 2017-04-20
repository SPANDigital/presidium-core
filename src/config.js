const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const config = module.exports;

//TODO validate required fields
config.load = function(configFile = '_config.yml') {
    try {
        const file = fs.readFileSync(configFile, 'utf8');
        return new Config(yaml.load(file));
    } catch (e) {
        console.log(e);
    }
};

var Config = function(config) {
    this.config = config;
};

Config.prototype.get = function(key, defaultVal = undefined) {
    return this.config[key] ? this.config[key] : defaultVal;
};

Config.prototype.logo = function() {
    return this.get('logo', './content/');
};

Config.prototype.brandName = function() {
    return this.get('name', '');
};

Config.prototype.baseUrl = function() {
    return path.join(this.get('baseurl', ''), '/');
};

Config.prototype.contentPath = function() {
    return this.get('content-path', './content/');
};

Config.prototype.mediaPath = function() {
    return this.get('media-path', './media/');
};

Config.prototype.distPath = function() {
    return this.get('dist-path', './dist/');
};

Config.prototype.distSrcPath = function() {
    return this.get('dist-src-path', path.join(this.distPath(), 'src/'));
};

Config.prototype.distContentPath = function() {
    return this.get('dist-content-path', this.distSrcPath());
};

Config.prototype.distMediaPath = function() {
    return this.get('dist-media-path', path.join(this.distSrcPath(), 'media/'));
};

Config.prototype.distIncludesPath = function() {
    return this.get('dist-includes-path', path.join(this.distSrcPath(), '_includes/'));
};

Config.prototype.distLayoutsPath = function() {
    return this.get('dist-layouts-path', path.join(this.distSrcPath(), '_layouts/'));
};

Config.prototype.distSectionsPath = function() {
    return this.get('dist-sections-path', path.join(this.distSrcPath(), 'sections/'));
};

Config.prototype.distSitePath = function() {
    return this.get('dist-site-path', path.join(this.distPath(), 'site/'));
};

Config.prototype.includeNestedArticles = function() {
    return this.get('include-nested-articles', true);
};







