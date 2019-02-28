var shell = require('shelljs');
var fs = require('fs-extra');
var path = require('path');
var site = require('./site');
var cpx = require("cpx");
var links = require('./links');
var linter = require('./linter');
var yaml = require('js-yaml');
var version = require('./version');
const argv = require('yargs').argv;
const utils = require('./utils');
const glob = require("glob")
var sanitizeHtml = require('sanitize-html');
const chalk = require('chalk');

var presidium = module.exports;

presidium.clean = function (conf) {
    const dist = conf.distPath;
    console.log(`Cleaning all files and folders in: ${dist}`);
    fs.removeSync(dist);
    fs.mkdirsSync(dist);
};

presidium.requirements = function () {
    //TODO move out of sh script
    shell.exec('./bin/presidium-requirements.sh');
};

presidium.install = function (conf) {
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

presidium.generate = function (conf) {
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

/**
 * This is called from the presidium-builder repo to clean out any potential
 * XSS threads. This is a whitelist approach, only allowing certain tags and
 * attributes. This is possibly too restrictive as is, but can be expanded upon.
 */
presidium.sanitize = function(conf) {
    var sanitize = function(dirty) {
        return sanitizeHtml(dirty, {
            allowedTags: [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'],
            allowedAttributes: {
                '*': ['class', 'data-*', 'href', 'align', 'alt', 'center', 'bgcolor', 
                    'id', 'style', 'name', 'target' ],
            }
        });
    }

    files = glob.sync(conf.contentPath + '/**/*');

    files.forEach(function(file) {
        if (fs.lstatSync(file).isDirectory()) {
            return;
        }

        buf = fs.readFileSync(file)
        var originalLen = buf.toString().length;
        clean = sanitize(buf.toString())
        if (clean.length != originalLen) {
            fs.writeFileSync(file, clean);
            console.log(chalk.red('Sanitized file: ', file))
        }
    });
};

presidium.build = function (conf) {
    // Manage extra config files
    const configFiles = `${argv.config}`;
    let extraConf = '';
    if (argv.config) {
        extraConf = configFiles.split(',').map(x => {
            x = path.isAbsolute(x) ? x : `../${x}`;
            return x;
        });
    }
    extraConf = extraConf ? `,${extraConf}` : '';

    console.log(`Building site...`);
    const pwd = shell.pwd();
    shell.cd(conf.jekyllPath);
    const cmd = `bundle exec jekyll build --config ../${path.join(conf.distSrcPath, '_config.yml')}${extraConf} --trace -s ../${conf.distSrcPath} -d ../${conf.distSitePath}`;

    console.log(`Executing: ${cmd}`);
    shell.exec(cmd);
    shell.cd(pwd);
};

presidium.validate = function (conf) {
    const results = links.validate(conf, argv);
    if (results.broken > 0 && (argv.fail_on_errors == 'true')) throw new Error('There are broken links in the site. Can not proceed.')
    if (argv.check && utils.contains(argv.check, 'author')) linter.validate(conf, argv);
};

presidium.watch = function (conf) {
    console.log(`Watching Content and Media...`);
    shell.exec(`cpx --watch "${conf.contentPath}/**" "${conf.distContentPath}/"`, { async: true });
    shell.exec(`cpx --watch "${conf.mediaPath}/**" "${conf.distMediaPath}/"`, { async: true });
};

presidium.develop = function (conf) {
    console.log(`Watching Presidium...`);
    shell.exec(`cpx --watch --verbose "node_modules/presidium-core/_includes/**" "${conf.distIncludesPath}/"`, { async: true });
    shell.exec(`cpx --watch --verbose "node_modules/presidium-core/_layouts/**" "${conf.distLayoutsPath}/"`, { async: true });
    shell.exec(`cpx --watch --verbose "node_modules/presidium-core/media/**" "${conf.distMediaPath}/"`, { async: true });
};

presidium.serve = function (conf) {
    console.log(`Serving...`);
    shell.cd('.jekyll');
    shell.exec(`bundle exec jekyll serve -s ../${conf.distSrcPath} -d ../${conf.distSitePath}`, { async: true });
    shell.cd('..');
};

presidium.ghPages = function (conf) {
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

    version.updateVersionsJson(conf);

    shell.cd(version.path);
    shell.exec(`git add -A &&
        git commit -m "Publish Update: ${conf.version || 'latest'}" &&
        git push origin gh-pages`);
    shell.cd('..');
};
