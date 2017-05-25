var shell = require('shelljs');
var fs = require('fs-extra');
var path = require('path');
var site = require('./site');
var cpx = require("cpx");
var links = require('./links');

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

presidium.version = function(conf, version) {
    // Fail if we're not in root.
    const vpath = './.versions';
    if (!shell.test('-d', vpath)) {
        const url = shell.exec('git remote get-url origin', {silent:true}).stdout;
        const reponame = shell.exec("basename -s .git " + url, {silent:true}).stdout.replace(/\r?\n|\r[|&;$%@"<>()+,]/g, "");
        shell.exec(`git clone --branch gh-pages --single-branch ${url}`);
        shell.mv(reponame, '.versions');
    }else{
        shell.cd(vpath);
        //shell.exec('git pull'); --  for now this can fail.
        shell.cd('..');
    }
    // Need to somehow update the _config.yml with the version number.
    // Create a new versioned config file that overrides things like baseurl.
    if (version){
        shell.exec(`touch _config${version}.yml`);
        shell.exec(`echo "baseurl: ${conf.baseUrl}${version}" > _config${version}.yml`);
    }
};

presidium.generate = function(conf, version="") {
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

    // TODO move this somewhere else
    if (!version) { // i.e. latest version
        const file = path.join(conf.distSrcPath, "versions.json");
        console.log(`Writing versions: ${file}...`);
        // need to generate this from updates - look at version number if the article front matter.
        // ENSURE THE VERSIONS ARE SORTED IN DESCENDING ORDER.
        fs.writeFileSync(file, JSON.stringify({
            "baseurl": conf.baseUrl,
            "selected": conf.versions.selected,
            "versions": [
                "latest",
                "1.5",
                "1.4",
                "0.0.1",
                "0.0.2"
            ]
        }));
    }

};

presidium.build = function(conf, version='') {
    console.log(`Building site...`);
    shell.cd(conf.jekyllPath);
    shell.exec(`bundle exec jekyll build --config ../_config.yml --trace -s ../${conf.distSrcPath} -d ../${conf.distSitePath}`);
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

presidium.ghPages = function(conf, version) {
    console.log('Publishing to Github Pages...');
    // Sync up versions with dist
    // TODO prevent rsync from deleting stuff.
    if (version){
        // Copy to directory in versions
        if (!shell.test('-d', version)) {
            fs.mkdirsSync(`./.versions/${version}`);
        }
        // Update ./versions/${version} with the contents of ./dist/site.
        shell.exec(`rsync -r ./dist/site/ ./.versions/${version}`);
        shell.rm(`_config${version}.yml`);
    } else {
        // Update root of ./versions with the contents of ./dist/site.
        shell.exec(`rsync -r ./dist/site/ ./.versions/`);
    }

    if (conf.cname) {
        console.log(`Using CNAME record: ${conf.cname}`);
        const file = path.join('./.versions', "CNAME");
        fs.writeFileSync(file, conf.cname);
    }
    shell.exec(`git-directory-deploy --directory ./.versions`);
};
