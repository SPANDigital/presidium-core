var shell = require('shelljs');
var fs = require('fs-extra');
var path = require('path');

var version = module.exports;

const REPO_NAME_REGEX = /\r?\n|\r[|&;$%@"<>()+,]/;
const SEMANTIC_VERSION_REGEX = /^(\d+\.)?(\d+\.)?(\*|\d+)$/;
const versionsPath = './.versions';

version.init = function (conf) {
    if (!shell.test('-d', versionsPath)) {
        const url = shell.exec('git remote get-url origin', {
            silent: true
        }).stdout;
        const reponame = shell.exec("basename -s .git " + url, {
            silent: true
        }).stdout.replace(REPO_NAME_REGEX, '');
        shell.exec(`git clone --branch gh-pages --single-branch ${url}`);
        shell.mv(reponame, '.versions');
    } else {
        shell.cd(versionsPath, path.join(conf.distSrcPath, "versions.json"));
        shell.exec('git pull origin gh-pages');
        shell.cd('..');
    }
    updateVersionsJson(conf);
};

version.clean = function(v, conf) {
    if (shell.test('-d', path.join(versionsPath, v))) {
        shell.rm('-rf', path.join(versionsPath, v));
        updateVersionsJson(conf, path.join(versionsPath, 'versions.json'));

        shell.cd(versionsPath);
        shell.exec('git add -A');
        shell.exec(`git commit -m "Remove version: ${v}"`);
        shell.exec('git push origin');
        shell.cd('..');
    }
};

function updateVersionsJson(conf){
    console.log('Writing new versions.json file...');
    fs.writeFileSync(path.join(versionsPath, 'versions.json'),
        JSON.stringify({
            "versioned": conf.versioned,
            "versions": listVersions('./.versions')
        })
    );
};

function listVersions(dir) {
    return fs.readdirSync(dir).filter((file) => {
        return SEMANTIC_VERSION_REGEX.test(file) &&
            fs.statSync(path.join(dir, '/', file)).isDirectory();
    }).concat(['latest']).reverse().slice(0, 5);
};