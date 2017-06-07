var shell = require('shelljs');
var fs = require('fs-extra');
var path = require('path');
var site = require('./site');
var cpx = require("cpx");
var links = require('./links');
var yaml = require('js-yaml');
var version = require('./version');

var presidium = module.exports;

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
    fs.copySync(path.join(conf.corePath, '.jekyll'), conf.jekyllPath);

    var pwd = shell.pwd();

    console.log('Installing Jekyll Gems...');
    shell.cd(conf.jekyllPath);
    shell.exec('bundle install --path=.bundle --deployment');

    console.log('Removing unused gems...');
    shell.exec('bundle clean');

    shell.cd(pwd);

};

presidium.generate = function(conf) {
    console.log(`Copy base templates...`);
    fs.copySync(path.join(conf.corePath, '_includes'), conf.distIncludesPath);
    fs.copySync(path.join(conf.corePath, '_layouts'), conf.distLayoutsPath);
    fs.copySync(path.join(conf.corePath, 'media'), conf.distMediaPath);

    console.log(`Write resolved config to the build directory...`);
    fs.writeFileSync(path.join(conf.distSrcPath, '_config.yml'), conf.raw, 'utf8');

    console.log(`Copy media assets...`);
    fs.copySync(conf.mediaPath, conf.distMediaPath);

    console.log(`Copy content...`);
    fs.copySync(conf.contentPath, conf.distSrcPath);

    console.log(`Generate site structure...`);
    site.generate(conf);
};

presidium.build = function(conf) {
    console.log(`Building site...`);
    const pwd = shell.pwd();
    shell.cd(conf.jekyllPath);
    const cmd = `bundle exec jekyll build --config ../${path.join(conf.distSrcPath, '_config.yml')} --trace -s ../${conf.distSrcPath} -d ../${conf.distSitePath}`;

    console.log(`Executing: ${cmd}`);
    shell.exec(cmd);
    shell.cd(pwd);
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

presidium.ghPages = function(conf) {
    console.log('Publishing to Github Pages...');
    const syncPath = path.join(version.path, conf.version);
    if (!shell.test('-d', syncPath)) {
        fs.mkdirsSync(syncPath);
    }
    shell.exec(`rsync -r ./dist/site/ ${syncPath}`);

    if (conf.cname) {
        console.log(`Using CNAME record: ${conf.cname}`);
        const file = path.join(version.path, "CNAME");
        fs.writeFileSync(file, conf.cname);
    }

    shell.cd(version.path);
    shell.exec(`git add -A &&
        git commit -m "Publish Update: ${conf.version || 'latest'}" &&
        git push origin gh-pages`);
    shell.cd('..');
};
