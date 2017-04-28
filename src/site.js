var structure = require('./structure');
var menu = require('./menu');
var pages = require('./pages');

var site = module.exports;

site.generate = function(conf) {
    const struct = structure.generate(conf);
    menu.generate(conf, struct);
    pages.generate(conf, struct)
};