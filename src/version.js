var shell = require('shelljs');
var fs = require('fs-extra');
var path = require('path');

var version = module.exports;

const REPO_NAME_REGEX = /\r?\n|\r[|&;$%@"<>()+,]/;
const SEMANTIC_VERSION_REGEX  =/^(\d+\.)?(\d+\.)?(\*|\d+)$/;

version.init = function(conf) {
    const versionsPath = './.versions';
    if (!shell.test('-d', versionsPath)) {
        const url = shell.exec('git remote get-url origin', {silent:true}).stdout;
        const reponame = shell.exec("basename -s .git " + url, {silent:true}).stdout.replace(REPO_NAME_REGEX, "");
        shell.exec(`git clone --branch gh-pages --single-branch ${url}`);
        shell.mv(reponame, '.versions');
    }else{
        shell.cd(versionsPath);
        shell.exec('git pull origin gh-pages');
        shell.cd('..');
    }

    if (!conf.version) { // i.e. latest version
        const file = path.join(conf.distSrcPath, "versions.json");

        console.log(`Writing versions: ${file}...`);
        fs.writeFileSync(file, JSON.stringify({
            "versioned": conf.versioned,
            "versions": listVersions('./.versions')
        }));
    }
};

function listVersions(dir) {
    return fs.readdirSync(dir).filter((file) => {
        return SEMANTIC_VERSION_REGEX.test(file) &&
            fs.statSync(path.join(dir,'/', file)).isDirectory();
    }).concat(['latest']).reverse().slice(0, 5);
};