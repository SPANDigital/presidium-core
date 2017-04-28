var shell = require('shelljs');
var fs = require('fs-extra');
var path = require('path');
var site = require('./site');
var cpx = require("cpx");

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
    fs.copySync('node_modules/presidium-core/.jekyll', conf.jekyllPath);

    console.log('Installing Jekyll Gems...');
    shell.cd('.jekyll');
    shell.exec('bundle install --path=.bundle --deployment');

    console.log('Removing unused gems...');
    shell.exec('bundle clean');
};

presidium.generate = function(conf) {
    console.log(`Copy base templates...`);
    fs.copySync('node_modules/presidium-core/_includes', conf.distIncludesPath);
    fs.copySync('node_modules/presidium-core/_layouts', conf.distLayoutsPath);
    fs.copySync('node_modules/presidium-core/media', conf.distMediaPath);

    console.log(`Copy config...`);
    fs.copySync('_config.yml', path.join(conf.distSrcPath, '_config.yml'));

    console.log(`Copy media assets...`);
    fs.copySync('media', conf.distMediaPath);

    console.log(`Copy content...`);
    fs.copySync('./content', conf.distSrcPath);

    console.log(`Generate site structure...`);
    site.generate(conf);
};

presidium.build = function(conf) {
    console.log(`Building site...`);
    shell.cd('.jekyll');
    shell.exec(`bundle exec jekyll build --trace -s ../${conf.distSrcPath} -d ../${conf.distSitePath}`);
    shell.cd('..');
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
    shell.exec(`git-directory-deploy --directory ${conf.distSrcPath}`);
};
