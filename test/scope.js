var config = require("../src/config");
var presidium = require("../src/presidium");
var shell = require('shelljs');
var assert = require('assert');

var fs = require('fs-extra');

describe('Scope Validation', function() {

    let conf;
    const distSrcPath = "./test/build/dist/src";
    const distSitePath = "./test/build/dist/site";
    const distPath = "./test/build/dist";

    describe('Unspecified Scope', function () {

        let conf;

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

        describe('Generate External', function() {
            conf = config.load("./test/scope/_config.yml");
            conf.scope = 'external';
            presidium.generate(conf);
        });

        it('Should generate dist src', () => {
            fs.readdir(distSrcPath, (err, files) => {
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

        it('Should generate dist site', () => {
            fs.readdir(distSitePath, (err, files) => {
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
            fs.readdir(distSitePath, (err, files) => {
                console.log(err);
            });
        });

    });

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

        describe('Generate Internal', function() {
            conf = config.load("./test/scope/_config.yml");
            conf.scope = 'internal';
            presidium.generate(conf);
        });

        it('Should generate dist src', () => {
            fs.readdir(distSrcPath, (err, files) => {
                if (!files.length) {
                    assert.fail("Should have created dist src files")
                }
            });
        });

        describe('Build Internal', function() {
            conf = config.load("./test/scope/_config.yml");
            //Relative to .jekyll
            conf.distSrcPath = "./scope/dist/src";
            conf.distSitePath = "./scope/dist/site";
            presidium.build(conf);
        });

        it('Should generate dist site', () => {
            fs.readdir(distSitePath, (err, files) => {
                if (!files.length) {
                    assert.fail("Should have created dist site")
                }
            });
        });

    });

    describe('External Scope', function () {
        describe('Clean', function() {
            conf = config.load("./test/scope/_config.yml");
            presidium.clean(conf);
        });

        it('Should clean dist site', () => {
            fs.readdir(distPath, (err, files) => {
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

        it('Should generate dist src', () => {
            fs.readdir(distSrcPath, (err, files) => {
                if (!files.length) {
                    assert.fail("Should have created dist src files")
                }
            });
        });

        describe('Build External', function() {
            conf = config.load("./test/scope/_config.yml");
            conf.scope = 'internal';
            //Relative to .jekyll
            conf.distSrcPath = "./scope/dist/src";
            conf.distSitePath = "./scope/dist/site";
            presidium.build(conf);
        });

        it('Should generate dist site', () => {
            fs.readdir(distSitePath, (err, files) => {
                if (!files.length) {
                    assert.fail("Should have created dist site")
                }
            });
        });

    });
});