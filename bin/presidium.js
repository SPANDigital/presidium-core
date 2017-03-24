#! /usr/bin/env node
var shell = require("shelljs");
var yargs = require("yargs");
var structure = require("../src/structure");

var argv = yargs.usage("$0 command")
    .command("structure", "Build site structure", function (yargs) {
        shell.exec("echo generate structure");
        shell.exec("pwd");
        structure.build("_config.yml", "./content/", "./dist/src/sections/")
    })
    .demand(1, "must provide a valid command")
    .help("h").alias("h", "help")
    .argv;

