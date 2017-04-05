const shell = require('shelljs');
const fs = require('fs-extra');
const path = require('path');
const structure = require('./structure');

const presidium = module.exports;

presidium.clean = function (config) {
    const dist = config.dist();
    console.log(`Cleaning all files and folders in: ${dist}`);
    fs.removeSync(dist);
    fs.mkdirsSync(dist);
};

presidium.requirements = function() {
    //TODO move out of sh script
    shell.exec('presidium-requirements');
};

presidium.install = function(config) {
    const dist = config.dist();
    fs.mkdirsSync(dist);

    presidium.requirements();

    shell.cd('.jekyll');
    shell.exec('bundle install --path=.bundle --deployment');
};

presidium.generate = function(config) {
    console.log(`Copy base templates...`);
    fs.copySync('node_modules/presidium-core/_includes', config.distIncludes());
    fs.copySync('node_modules/presidium-core/_layouts', config.distLayouts());
    fs.copySync('node_modules/presidium-core/media', config.distMedia());

    console.log(`Copy config...`);
    fs.copySync('_config.yml', path.join(config.distSrc(), '_config.yml'));

    console.log(`Copy media assets...`);
    fs.copySync('media', config.distMedia());

    console.log(`Copy content...`);
    fs.copySync('./content', config.distSrc());

    console.log(`Generate sections and menu...`);
    structure.build(config);
};

presidium.build = function(config) {
    presidium.generate(config);

    console.log(`Building site...`);
    shell.cd('.jekyll');
    shell.exec(`bundle exec jekyll build --trace -s ../${config.distSrc()} -d ../${config.distSite()}`);
    shell.cd('..');
};

presidium.serve = function(config) {
    presidium.generate(config);

    console.log(`Serving...`);
    shell.cd('.jekyll');
    shell.exec(`bundle exec jekyll serve --incremental --port 4001 -s ../${config.distSrc()} -d ../${config.distSite()}`);
    shell.cd('..');
};

presidium.publish = function(config) {
    console.log('Publishing to Github Pages...');
    shell.exec(`git-directory-deploy --directory ${config.distSrc()}`);
};
