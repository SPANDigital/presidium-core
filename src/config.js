var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

var config = module.exports;

const CONFIG_VAR_REGEX = /\$([{A-Z])\w+}/g;

/**
 * Load config file with defaults
 * @param filename
 */
config.load = function(filename = '_config.yml', version='') {
    const conf = new Config(filename, version);

    const distPath      = conf.get('dist-path', './dist/');
    const distSrcPath   = conf.get('dist-src-path', path.join(distPath, 'src/'));
    const distSite      = conf.get('dist-site-path', path.join(distPath, 'site/'));
    //const baseUrl       = path.join(conf.get('baseurl', '/'), '/');

    return {
        logo:               conf.get('logo', ''),
        brandName:          conf.get('name', ''),
        baseUrl:            path.join(conf.get('baseurl', ''), '/'),//baseUrl,
        cname:              conf.get('cname', ''),

        //sectionsBaseUrl:  path.join(conf.get('sections-baseurl', baseUrl), '/'),
        sections:           conf.get('sections', []),

        roles:              conf.get('roles', { label: '', all: '', options: [] }),

        corePath:           conf.get('core-path', 'node_modules/presidium-core'),

        contentPath:        conf.get('content-path', './content/'),
        mediaPath:          conf.get('media-path', './media/'),

        raw:                yaml.safeDump(conf.config, {}),
        version:            version,
        versioned:          conf.get('versioned', false),

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

var Config = function(filename, version) {
    //TODO validate config
    this.config = resolveConfig(load(filename), version);
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
};

/**
 * Helper function that resolves any variable depenencies in the config.
 * @param {String} version - The version number supplied.
 * @param {Object} conf - The parsed config file.
 */
function resolveConfig(conf, version='') {
    conf['siteroot'] = conf.baseurl || '/';
    if(version) {
      conf['baseurl'] = path.join(conf.siteroot, version);
    }

    for (let key in conf) {
        if (CONFIG_VAR_REGEX.test(conf[key])){
            conf[key] = resolve(conf[key], conf, [key]);
        }
    }
    return conf;
};

/**
 * Recursively resolve variable depedencies.
 * @param {String} value - String to resolve of dependencies.
 * @param {Dictionary} conf - The parsed config file.
 * @param {Array} ring - An array of previously seen keys.
 */
function resolve(value, conf, ring=[]) {
    value.match(CONFIG_VAR_REGEX).forEach((variable) => {
        const key = variable.substring(variable.lastIndexOf("${") + 2,variable.lastIndexOf("}"));

        if (ring.includes(key)) {
            throw `Circular dependency error: cannot resolve variable(s) ${ring}.`;
        }
        ring.push(key);

        let resolved = conf[key];
        if (!resolved){
            throw `Could not resolve ${key} - make sure this key is defined in _config.yml.`;
        }
        if (CONFIG_VAR_REGEX.test(resolved)){
            resolved = resolve(resolved, conf, ring);
        }
        value = value.replace(variable, resolved);
        ring.pop();
    });
    return value;
};
