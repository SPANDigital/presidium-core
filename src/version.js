var shell = require('shelljs');
var fs = require('fs-extra');
var path = require('path');

var version = module.exports;

const REPO_NAME_REGEX = /\r?\n|\r[|&;$%@"<>()+,]/;
const SEMANTIC_VERSION_REGEX = /^(\d+\.)?(\d+\.)?(\*|\d+)$/;

version.path = './.versions';

version.init = function (conf) {
    if (!shell.test('-d', version.path)) {
        const url = shell.exec('git remote get-url origin', {
            silent: true
        }).stdout;
        const reponame = shell.exec("basename -s .git " + url, {
            silent: true
        }).stdout.replace(REPO_NAME_REGEX, '');
        shell.exec(`git clone --branch gh-pages --single-branch ${url}`);
        shell.mv(reponame, '.versions');
    } else {
        shell.cd(version.path);
        shell.exec('git pull origin gh-pages');
        shell.cd('..');
    }
    updateVersionsJson(conf);
};

version.clean = function(v, conf) {
    if (shell.test('-d', path.join(version.path, v))) {
        shell.rm('-rf', path.join(version.path, v));
        updateVersionsJson(conf, path.join(version.path, 'versions.json'));

        shell.cd(version.path);
        shell.exec('git add -A');
        shell.exec(`git commit -m "Remove version: ${v}"`);
        shell.exec('git push origin');
        shell.cd('..');
    }
};

function updateVersionsJson(conf){
    console.log('Writing new versions.json file...');
    fs.writeFileSync(path.join(version.path, 'versions.json'),
        JSON.stringify({
            "versioned": conf.versioned,
            "versions": listVersions(version.path)
        })
    );
};

function listVersions(dir) {
    return fs.readdirSync(dir).filter((file) => {
        return SEMANTIC_VERSION_REGEX.test(file) &&
            fs.statSync(path.join(dir, '/', file)).isDirectory();
    }).concat(['latest']).reverse().slice(0, 5);
};