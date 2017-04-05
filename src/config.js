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

Config.prototype.content = function() {
    return this.get('content-path', "./content/");
};

Config.prototype.dist = function() {
    return this.get('dist-path', "./dist/");
};

Config.prototype.distSrc = function() {
    return this.get('dist-src-path', path.join(this.dist(), "src/"));
};

Config.prototype.distSite = function() {
    return this.get('dist-site-path', path.join(this.dist(), "site/"));
};

Config.prototype.distMedia = function() {
    return this.get('media-path', path.join(this.distSrc(), "media/"));
};

Config.prototype.distIncludes = function() {
    return this.get('includes-path', path.join(this.distSrc(), "_includes/"));
};

Config.prototype.distLayouts = function() {
    return this.get('layouts-path', path.join(this.distSrc(), "_layouts/"));
};

Config.prototype.distSections = function() {
    return this.get('sections-path', path.join(this.distSrc(), "sections/"));
};





