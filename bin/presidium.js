#! /usr/bin/env node
var yargs = require("yargs");
var shell = require("shelljs")
var config = require("../src/config");
var presidium = require("../src/presidium");

var conf = config.load("_config.yml");

var argv = yargs.usage("$0 command")
    .command("requirements", "Install jekyll gems and npm dependencies", function (yargs) {
        presidium.requirements(conf);
    })
    .command("clean", "Clean build directory", function (yargs) {
        presidium.clean(conf);
    })
    .command("install", "Install jekyll gems and npm dependencies", function (yargs) {
        presidium.install(conf);
    })
    .command("build", "Build site", function (yargs) {
        presidium.generate(conf);
        presidium.build(conf);
    })
    .command("serve", "Serve site", function (yargs) {
        presidium.serve(conf);
    })
    .command("start", "Build and serve", function (yargs) {
        presidium.clean(conf);
        presidium.generate(conf);
        presidium.serve(conf);
    })
    .command("publish", "Publish to Github Pages", function (yargs) {
        presidium.clean(conf);
        presidium.generate(conf);
        presidium.build(conf);
        presidium.publish(conf);
    })
    .demand(1, "must provide a valid command")
    .help("h").alias("h", "help")
    .argv;

