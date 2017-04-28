var config = require("../../src/config");
var presidium = require("../../src/presidium");

var assert = require('assert');

describe('Build Site', function() {

    describe('Clean', function() {
        var siteConfig = config.load("_config.yml");
        presidium.clean(siteConfig);
    });

    describe('Build', function() {
        var siteConfig = config.load("_config.yml");
        presidium.generate(siteConfig);
    });

});