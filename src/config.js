var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

var config = module.exports;

/**
 * Load config file with defaults
 * @param filename
 */
config.load = function(filename = '_config.yml') {
    const conf = new Config(filename);

    const distPath      = conf.get('dist-path', './dist/');
    const distSrcPath   = conf.get('dist-src-path', path.join(distPath, 'src/'));
    const distSite      = conf.get('dist-site-path', path.join(distPath, 'site/'));

    return {
        logo:               conf.get('logo', ''),
        brandName:          conf.get('name', ''),
        baseUrl:            path.join(conf.get('baseurl', ''), '/'),
        sections:           conf.get('sections', []),

        roles:              conf.get('roles', { label: '', all: '', options: [] }),

        contentPath:        conf.get('content-path', './content/'),
        mediaPath:          conf.get('media-path', './media/'),

        distPath:           distPath,
        distSrcPath:        distSrcPath,
        distSitePath:       distSite,
        distContentPath:    conf.get('dist-content-path', distSrcPath),
        distMediaPath:      conf.get('dist-media-path', path.join(distSrcPath, 'media/')),
        distIncludesPath:   conf.get('dist-includes-path', path.join(distSrcPath, '_includes/')),
        distLayoutsPath:    conf.get('dist-layouts-path', path.join(distSrcPath, '_layouts/')),
        distSectionsPath:   conf.get('dist-sections-path', path.join(distSrcPath, 'sections/')),

        jekyllPath: conf.get('jekyll-path', '.jekyll/'),

        includeNestedArticles: conf.get('include-nested-articles', true)
    }
};

var Config = function(filename) {
    //TODO validate config
    this.config = load(filename);
};

Config.prototype.get = function(key, defaultVal = undefined) {
    return this.config.hasOwnProperty(key) ? this.config[key] : defaultVal;
};

function load(filename) {
    try {
        const file = fs.readFileSync(filename, 'utf8');
        return yaml.load(file);
    } catch (e) {
        console.log(e);
    }
}