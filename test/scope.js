var config = require("../src/config");
var presidium = require("../src/presidium");

var assert = require('assert');

var fs = require('fs-extra');

describe('Scope Validation', function() {

    let conf;

    describe('Internal Scope', function () {
        describe('Clean', function() {
            conf = config.load("./test/scope/_config.yml");
            presidium.clean(conf);
        });

        it('Should clean dist site', () => {
            fs.readdir(conf.distPath, (err, files) => {
                if (files.length && files.length > 0) {
                    assert.fail("Should have cleaned up")
                }
            });
        });

        describe('Generate', function() {
            conf = config.load("./test/scope/_config.yml");
            presidium.generate(conf);
        });

        it('Should generate dist src', () => {
            fs.readdir(conf.distSrcPath, (err, files) => {
                if (!files.length) {
                    assert.fail("Should have created dist src files")
                }
            });
        });

        describe('Build', function() {
            conf = config.load("./test/scope/_config.yml");
            //Relative to .jekyll
            conf.distSrcPath = "./scope/dist/src";
            conf.distSitePath = "./scope/dist/site";
            presidium.build(conf);
        });

        it('Should generate dist site', () => {
            fs.readdir(conf.distSitePath, (err, files) => {
                if (!files.length) {
                    assert.fail("Should have created dist site")
                }
            });
        });
    });
});