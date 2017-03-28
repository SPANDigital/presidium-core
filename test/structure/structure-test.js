var config = require("../../src/config");
var structure = require("../../src/structure");

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


    describe('Group By Section', function() {
        const path = "./test/structure/dist/src/sections/";
        fs.emptydirSync(path);
        var siteConfig = config.load("./test/structure/_config.yml");
        structure.build(siteConfig, "./test/structure/content/", path);
    });

});