#! /usr/bin/env node
var shell = require("shelljs");
var yargs = require("yargs");
var structure = require("../src/structure");
var config = require("../src/config");
var fs = require("fs-extra");

var argv = yargs.usage("$0 command")
    .command("structure", "Build site structure", function (yargs) {
        var siteConfig = config.load("_config.yml");

        // shell.exec("pwd");
        structure.build(siteConfig, "./dist/src/sections/");
    })
    .demand(1, "must provide a valid command")
    .help("h").alias("h", "help")
    .argv;

