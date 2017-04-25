const shell = require('shelljs');
const fs = require('fs-extra');
const path = require('path');
const structure = require('./structure');
const cpx = require("cpx");

const presidium = module.exports;

presidium.clean = function (config) {
    const dist = config.distPath();
    console.log(`Cleaning all files and folders in: ${dist}`);
    fs.removeSync(dist);
    fs.mkdirsSync(dist);
};

presidium.requirements = function() {
    //TODO move out of sh script
    shell.exec('presidium-requirements');
};

presidium.install = function(config) {
    presidium.requirements();

    console.log(`Creating ${config.distPath()}...`);
    const dist = config.distPath();
    fs.mkdirsSync(dist);

    console.log('Copying Gemfile...');
    fs.mkdirsSync(config.jekyllPath());
    fs.copySync('node_modules/presidium-core/.jekyll', config.jekyllPath());

    console.log('Installing Jekyll Gems...');
    shell.cd('.jekyll');
    shell.exec('bundle install --path=.bundle --deployment');

    console.log('Removing unused gems...');
    shell.exec('bundle clean');
};

presidium.generate = function(config) {
    console.log(`Copy base templates...`);
    fs.copySync('node_modules/presidium-core/_includes', config.distIncludesPath());
    fs.copySync('node_modules/presidium-core/_layouts', config.distLayoutsPath());
    fs.copySync('node_modules/presidium-core/media', config.distMediaPath());

    console.log(`Copy config...`);
    fs.copySync('_config.yml', path.join(config.distSrcPath(), '_config.yml'));

    console.log(`Copy media assets...`);
    fs.copySync('media', config.distMediaPath());

    console.log(`Copy content...`);
    fs.copySync('./content', config.distSrcPath());

    console.log(`Generate sections and menu...`);
    structure.build(config);
};

presidium.build = function(config) {
    presidium.generate(config);

    console.log(`Building site...`);
    shell.cd('.jekyll');
    shell.exec(`bundle exec jekyll build --trace -s ../${config.distSrcPath()} -d ../${config.distSitePath()}`);
    shell.cd('..');
};

presidium.watch = function(config) {
    console.log(`Watching Content and Media...`);
    shell.exec(`cpx --watch "${config.contentPath()}/**" "${config.distContentPath()}/"`, {async: true});
    shell.exec(`cpx --watch "${config.mediaPath()}/**" "${config.distMediaPath()}/"`, {async: true});
};

presidium.develop = function(config) {
    console.log(`Watching Presidium...`);
    shell.exec(`cpx --watch --verbose "node_modules/presidium-core/_includes/**" "${config.distIncludesPath()}/"`, {async: true});
    shell.exec(`cpx --watch --verbose "node_modules/presidium-core/_layouts/**" "${config.distLayoutsPath()}/"`, {async: true});
    shell.exec(`cpx --watch --verbose "node_modules/presidium-core/media/**" "${config.distMediaPath()}/"`, {async: true});
};

presidium.serve = function(config) {
    console.log(`Serving...`);
    shell.cd('.jekyll');
    shell.exec(`bundle exec jekyll serve -s ../${config.distSrcPath()} -d ../${config.distSitePath()}`, {async: true});
    shell.cd('..');
};

presidium.ghPages = function(config) {
    console.log('Publishing to Github Pages...');
    shell.exec(`git-directory-deploy --directory ${config.distSrcPath()}`);
};
