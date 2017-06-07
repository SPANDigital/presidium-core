var config = require("../src/config");
var site = require("../src/site");
var links = require("../src/links");
var shell = require("shelljs")
var path = require("path");

var fs = require("fs-extra");

var assert = require('assert');

let res;
let conf;

describe('Link Validation', () => {

    //TODO: generalise this for re-use - create testSetup method
    describe('Build Site', () => {
        conf = config.load("./test/validation/_config.yml");
        fs.emptydirSync(conf.distSrcPath);

        // fs.copySync('_includes', conf.distIncludesPath);
        // fs.copySync('_layouts', conf.distLayoutsPath);
        // fs.copySync(conf.contentPath, conf.distSrcPath);
        // fs.copySync('./test/validation/_config.yml', path.join(conf.distSrcPath, '_config.yml'));

        // site.generate(conf);

        //
        // shell.cd(conf.jekyllPath);
        // shell.exec(`bundle exec jekyll build --trace -s ../validation/dist/src/ -d ../validation/dist/site/`);

        // conf.distSitePath = '../../' + conf.distSitePath;
        //
        // res = links.validate(conf)
    });

    it.skip('Should find and validate links', () => {
        assert.equal(res.total, res.valid + res.broken + res.warning + res.external);
        assert.notEqual(res.total, 0);
    });

    it.skip('Should indicate broken links', () => {
        assert.equal(res.broken, 5);
    });

    it.skip('Should warn for uncertain links', () => {
        if (conf.baseUrl === '/') {
            assert.equal(res.warning, 2)
        } else {
            assert.equal(res.warning, 3)
        }

    });

    it.skip('Should indicate valid links', () => {
        assert.equal(res.valid, 5);
    });

    it.skip('Should indicate external links', () => {
        assert.equal(res.external, 1);
    });

});