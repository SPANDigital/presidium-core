var config = require("../src/config");
var site = require("../src/site");
var links = require("../src/links");
var path = require("path");

var presidium = require("../src/presidium");

var fs = require("fs-extra");

var assert = require('assert');

let res, conf;

describe('Link Validation', () => {

    describe('Build Site', () => {
        conf = config.load("./test/validation/_config.yml");
        fs.emptydirSync(conf.distSrcPath);
        presidium.clean(conf);
        presidium.generate(conf);

        //Set relative paths for jekyll build from ./test/.jekyll
        conf.distSrcPath = './validation/dist/src';
        conf.distSitePath = './validation/dist/site';
        presidium.build(conf);

        conf = config.load("./test/validation/_config.yml");
        res = links.validate(conf);
    });

    it('Should find and validate links', () => {
        assert.equal(res.total, res.valid + res.broken + res.warning + res.external);
        assert.notEqual(res.total, 0);
    });

    it('Should indicate broken links', () => {
        assert.equal(res.broken, 5);
    });

    it('Should warn for uncertain links', () => {
        if (conf.baseUrl === '/') {
            assert.equal(res.warning, 2)
        } else {
            assert.equal(res.warning, 3)
        }

    });

    it('Should indicate valid links', () => {
        assert.equal(res.valid, 5);
    });

    it('Should indicate external links', () => {
        assert.equal(res.external, 1);
    });

});