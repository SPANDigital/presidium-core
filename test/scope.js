var config = require("../src/config");
var presidium = require("../src/presidium");
var shell = require('shelljs');
var assert = require('assert');
var path = require('path');
var fs = require('fs-extra');

describe('Scope Validation', function() {

    let conf;
    const distSrcPath = "./test/scope/dist/src";
    const distSitePath = "./test/scope/dist/site";
    const distPath = "./test/scope/dist";
    const internal_path = path.join(distSitePath, 'key-concepts', 'scope-overview', 'internal-scope');
    const external_path = path.join(distSitePath, 'key-concepts', 'scope-overview', 'external-scope');

    describe('Unspecified Scope', function () {

        let conf;

        describe('Clean', function() {
            conf = config.load("./test/scope/_config.yml");
            presidium.clean(conf);
        });

        it('Should clean dist site', function() {
            fs.readdir(conf.distPath, function(err, files) {
                if (files.length && files.length > 0) {
                    assert.fail("Should have cleaned up")
                }
            });
        });

        describe('Generate External', function() {
            conf = config.load("./test/scope/_config.yml");
            conf.scope = 'external';
            presidium.generate(conf);
        });

        it('Should generate dist src', function() {
            fs.readdir(distSrcPath, function(err, files) {
                if (!files.length) {
                    assert.fail("Should have created dist src files")
                }
            });
        });

        describe('Build Site', function() {
            conf = config.load("./test/scope/_config.yml");
            conf.scope = 'internal';
            //Relative to .jekyll
            conf.distSrcPath = "./scope/dist/src";
            conf.distSitePath = "./scope/dist/site";
            presidium.build(conf);
        });

        it('Should generate dist site', function() {
            fs.readdir(distSitePath, function(err, files) {
                if (!files.length) {
                    assert.fail("Should have created dist site")
                }
            });
        });

        describe('View All Articles', function() {
            conf = config.load("./test/scope/_config.yml");
            conf.distSitePath = "./test/scope/dist/site";
        });

        it('Should be able to view all articles, regardless of scope', function () {
            fs.readdir(distSitePath, function(err, files) {
                console.log(err);
            });
        });

    });

    describe('Internal Scope', function () {
        before(function() {
            conf = config.load("./test/scope/_config.yml");
            // conf.scope = 'internal';
            presidium.clean(conf);
            presidium.generate(conf);
            conf.distSrcPath = "./scope/dist/src";
            conf.distSitePath = "./scope/dist/site";
            presidium.build(conf);
        });

        it('Should have no external articles', function(done) {
            fs.readdir(external_path, function(err, files) {
                files.forEach(function(file) {
                    fs.readFile(path.join(external_path, file), 'utf-8', function(err, content) {
                        if (content.includes('External Article')) {
                            assert.fail('Found an external article');
                            done();
                        }
                    });
                });
            });
        });
    });

    describe('External Scope', function() {
        describe('Clean', function() {
            conf = config.load("./test/scope/_config.yml");
            presidium.clean(conf);
        });

        it('Should clean dist site', function() {
            fs.readdir(distPath, function(err, files) {
                if (files.length && files.length > 0) {
                    assert.fail("Should have cleaned up")
                }
            });
        });

        describe('Generate External', function() {
            conf = config.load("./test/scope/_config.yml");
            conf.scope = 'external';
            presidium.generate(conf);
        });

        it('Should generate dist src', function() {
            fs.readdir(distSrcPath, function(err, files) {
                if (!files.length) {
                    assert.fail("Should have created dist src files")
                }
            });
        });

        describe('Build External', function() {
            conf = config.load("./test/scope/_config.yml");
            conf.scope = 'external';
            //Relative to .jekyll
            conf.distSrcPath = "./scope/dist/src";
            conf.distSitePath = "./scope/dist/site";
            presidium.build(conf);
        });

        it('Should generate dist site', function() {
            fs.readdir(distSitePath, function(err, files) {
                if (!files.length) {
                    assert.fail("Should have created dist site")
                }
            });
        });

        it('Should have no internal articles', function() {
            fs.readdir(internal_path, function(err, files) {
                if (files.length) {
                    assert.fail("Non-internal articles found")
                }
            });
        });

    });
});