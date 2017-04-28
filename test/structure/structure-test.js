var config = require("../../src/config");
var structure = require("../../src/structure");
var site = require("../../src/site");

var fs = require("fs-extra");

var assert = require('assert');

describe('Generate Site Structure', function() {

    // describe('Traverse Section Files', function() {
    //
    //     var files = structure.traverseSync("./test/structure/content/");
    //
    //     it('should traverse all files', function() {
    //         assert.equal(23, files.length);
    //     });
    //
    //     it('should parse frontmatter', function() {
    //         const fm = files[0].properties;
    //         assert.equal("Article in Category", fm.title);
    //         assert.equal("Category", fm.category);
    //     });
    // });


    describe('Build Site', function() {
        var conf = config.load("./test/structure/_config.yml");
        fs.emptydirSync(conf.distSrcPath);
        site.generate(conf);
    });


    describe('TEST', function() {
        var url = require('url');
        var isRoot = function(root, reference, baseurl = "/") {
            if (root == baseurl) {
                return root == reference;
            }
            return reference.startsWith(root);
        };
        it('Should validate parent root url', () => {
            assert.equal(true, isRoot("/p/", "/p/"));
            assert.equal(true, isRoot("/p", "/p/"));
            assert.equal(true, isRoot("/p", "/p"));

            assert.equal(true, isRoot("/p/", "/p/a"));
            assert.equal(true, isRoot("/p/", "/p/a/t"));

            assert.equal(false, isRoot("/b/", "/p"));
            assert.equal(false, isRoot("/b/", "/p/a"));
            assert.equal(false, isRoot("b/", "/b/"));

            assert.equal(true, isRoot("/root/p/", "/root/p/a", "root"));
            assert.equal(false, isRoot("/root/p/", "/root/", "root"));

            assert.equal(false, isRoot("/base", "/base/p/", "/base"));
            assert.equal(false, isRoot("/", "/p/", "/"));
        });

    });

});