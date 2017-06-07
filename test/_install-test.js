var config = require("../src/config");
var presidium = require("../src/presidium");
var fs = require("fs");

var assert = require('assert');

describe('Install Dependencies', function() {
    var siteConfig = config.load("./test/build/_config.yml");

    describe('Install', function() {
        presidium.install(siteConfig);
    });

    it('Should Install Jekyll Gems', function() {
        if (!fs.existsSync('./test/.jekyll/Gemfile')) {
            assert.fail('Expected .jekyll/Gemfile');
        }
    })
});