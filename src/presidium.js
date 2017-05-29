var shell = require('shelljs');
var fs = require('fs-extra');
var path = require('path');
var site = require('./site');
var cpx = require("cpx");
var links = require('./links');
var yaml = require('js-yaml');

var presidium = module.exports;

const REPO_NAME_REGEX = /\r?\n|\r[|&;$%@"<>()+,]/g;
const CONFIG_VAR_REGEX = /\$([{A-Z])\w+}/g;
const SEMANTIC_VERSION_REGEX  =/^(\d+\.)?(\d+\.)?(\*|\d+)$/g;

function load(filename) {
    try {
        const file = fs.readFileSync(filename, 'utf8');
        return yaml.load(file);
    } catch (e) {
        console.log(e);
    }
}

presidium.clean = function (conf) {
    const dist = conf.distPath;
    console.log(`Cleaning all files and folders in: ${dist}`);
    fs.removeSync(dist);
    fs.mkdirsSync(dist);
};

presidium.requirements = function() {
    //TODO move out of sh script
    shell.exec('presidium-requirements');
};

presidium.install = function(conf) {
    presidium.requirements();

    console.log(`Creating ${conf.distPath}...`);
    const dist = conf.distPath;
    fs.mkdirsSync(dist);

    console.log('Copying Gemfile...');
    fs.mkdirsSync(conf.jekyllPath);
    fs.copySync('node_modules/presidium-core/.jekyll', conf.jekyllPath);

    console.log('Installing Jekyll Gems...');
    shell.cd('.jekyll');
    shell.exec('bundle install --path=.bundle --deployment');

    console.log('Removing unused gems...');
    shell.exec('bundle clean');
};

presidium.version = function(conf, version='') {
    // Fail if we're not in root.
    const vpath = './.versions';
    if (!shell.test('-d', vpath)) {
        const url = shell.exec('git remote get-url origin', {silent:true}).stdout;
        const reponame = shell.exec("basename -s .git " + url, {silent:true}).stdout.replace(REPO_NAME_REGEX, "");
        shell.exec(`git clone --branch gh-pages --single-branch ${url}`);
        shell.mv(reponame, '.versions');
    }else{
        shell.cd(vpath);
        //shell.exec('git pull'); --  for now this can fail.
        shell.cd('..');
    }
    // Update the loaded config baseurl.
    conf.baseUrl = `${conf.baseUrl}${version}`;
};

function listVersions(dir) {
    let versions = fs.readdirSync(dir).filter((file) => {
        const fullpath = path.join(dir,'/', file);
        return SEMANTIC_VERSION_REGEX.test(file) && fs.statSync(fullpath).isDirectory();
    }).reverse().slice(0, 4);
    versions.unshift('latest');
    return versions;
}

function resolve(value, conf, dependencyCheck=[]) {
    value.match(CONFIG_VAR_REGEX).forEach((variable) => {
        const key = variable.substring(variable.lastIndexOf("${") + 2,variable.lastIndexOf("}"));

        if (!dependencyCheck.indexOf(key)) {
            throw `Circular dependency error: cannot resolve variables ${dependencyCheck}`;
        }
        dependencyCheck.push(key);

        let resolved = conf[key];
        if (!resolved){
            throw `Could not resolve ${key} ... make sure this key is defined in _config.yml`;
        }else{
            if (CONFIG_VAR_REGEX.test(resolved)){
                resolved = resolve(resolved, conf, dependencyCheck);
            }
            value = value.replace(variable, resolved);
        }
    });
    return value;
}

/**
 * 
 * @param {*} version {String} - The version number supplied.  
 * @param {*} configPath {String} - The path to the build area . 
 */
function resolveConfig(version='', configPath) {
    let conf = load('./_config.yml');
    /* Create siteroot variable to store the true baseurl. */
    conf['siteroot'] = conf.baseurl;
    /* Update baseurl with a version number if supplied. */
    conf['baseurl'] = path.join(conf['baseurl'], version)

    /* Check for variable dependencies. */
    for (let key in conf) {
        if (CONFIG_VAR_REGEX.test(conf[key])){
            conf[key] = resolve(conf[key], conf, [key]);
        }
    }
    /* Write the resolved configuration to ./dist/src. */
    fs.writeFileSync(configPath, yaml.safeDump (conf, {}), 'utf8');
}

presidium.generate = function(conf, version='') {
    console.log(`Copy base templates...`);
    fs.copySync('node_modules/presidium-core/_includes', conf.distIncludesPath);
    fs.copySync('node_modules/presidium-core/_layouts', conf.distLayoutsPath);
    fs.copySync('node_modules/presidium-core/media', conf.distMediaPath);

    console.log(`Resolve & copy config...`);
    resolveConfig(version, path.join(conf.distSrcPath, '_config.yml'));

    console.log(`Copy media assets...`);
    fs.copySync('media', conf.distMediaPath);

    console.log(`Copy content...`);
    fs.copySync('./content', conf.distSrcPath);

    console.log(`Generate site structure...`);
    site.generate(conf);

    // TODO move this somewhere else
    if (!version) { // i.e. latest version
        const file = path.join(conf.distSrcPath, "versions.json");
        console.log(`Writing versions: ${file}...`);
        fs.writeFileSync(file, JSON.stringify({
            "versioned": conf.versioned,
            "versions": listVersions('./.versions')
        }));
    }

};

presidium.build = function(conf, version='') {
    console.log(`Building site...`);
    shell.cd(conf.jekyllPath);
    shell.exec(`bundle exec jekyll build  --config ../${conf.distSrcPath}/_config.yml --trace -s ../${conf.distSrcPath} -d ../${conf.distSitePath}`);
    shell.cd('..');
};

presidium.validate = function(conf) {

    const results = links.validate(conf);

    if(results.broken > 0) {
        throw new Error('There are broken links in the site. Can not proceed.')
    }
};

presidium.watch = function(conf) {
    console.log(`Watching Content and Media...`);
    shell.exec(`cpx --watch "${conf.contentPath}/**" "${conf.distContentPath}/"`, {async: true});
    shell.exec(`cpx --watch "${conf.mediaPath}/**" "${conf.distMediaPath}/"`, {async: true});
};

presidium.develop = function(conf) {
    console.log(`Watching Presidium...`);
    shell.exec(`cpx --watch --verbose "node_modules/presidium-core/_includes/**" "${conf.distIncludesPath}/"`, {async: true});
    shell.exec(`cpx --watch --verbose "node_modules/presidium-core/_layouts/**" "${conf.distLayoutsPath}/"`, {async: true});
    shell.exec(`cpx --watch --verbose "node_modules/presidium-core/media/**" "${conf.distMediaPath}/"`, {async: true});
};

presidium.serve = function(conf) {
    console.log(`Serving...`);
    shell.cd('.jekyll');
    shell.exec(`bundle exec jekyll serve -s ../${conf.distSrcPath} -d ../${conf.distSitePath}`, {async: true});
    shell.cd('..');
};

presidium.ghPages = function(conf, version='') {
    console.log('Publishing to Github Pages...');

    if (!shell.test('-d', `./.versions/${version}`)) {
        fs.mkdirsSync(`./.versions/${version}`);
    }
    shell.exec(`rsync -r ./dist/site/ ./.versions/${version}`);

    if (conf.cname) {
        console.log(`Using CNAME record: ${conf.cname}`);
        const file = path.join('./.versions', "CNAME");
        fs.writeFileSync(file, conf.cname);
    }
    shell.exec(`git-directory-deploy --directory ./.versions`);
};
