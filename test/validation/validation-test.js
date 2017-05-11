var config = require("../../src/config");
var site = require("../../src/site");
var links = require("../../src/links");
var shell = require("shelljs")
var path = require("path");

var fs = require("fs-extra");

var assert = require('assert');

let res = {};

describe('Link Validation', () => {

    describe('Build Site', () => {
        var conf = config.load("./test/validation/_config.yml");
        fs.emptydirSync(conf.distSrcPath);

        fs.copySync('_includes', conf.distIncludesPath);
        fs.copySync('_layouts', conf.distLayoutsPath);
        fs.copySync(conf.contentPath, conf.distSrcPath);
        fs.copySync('./test/validation/_config.yml', path.join(conf.distSrcPath, '_config.yml'));

        site.generate(conf);

        shell.cd(conf.jekyllPath);
        shell.exec(`bundle exec jekyll build --trace -s ../validation/dist/src/ -d ../validation/dist/site/`);

        conf.distSitePath = '../../' + conf.distSitePath;

        res = links.validate(conf)
    });

    it('Should find and validate links', () => {
        assert.equal(res.total, res.valid + res.broken + res.warning + res.external);
        assert.notEqual(0, res.total);
    });

    it('Should indicate broken links', () => {
        assert.equal(5, res.broken);
    });

    it('Should warn for uncertain links', () => {
        assert.equal(2, res.warning);
    });

    it('Should indicate valid links', () => {
        assert.equal(5, res.valid);
    });

    it('Should indicate external links', () => {
        assert.equal(1, res.external);
    });

});