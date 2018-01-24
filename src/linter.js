var structure = require('./structure');
var remark = require('remark');
var strip = require('strip-markdown');
var path = require('path');
var fs = require('fs-extra');

const colours = require('colors/safe');

const linter = module.exports;
let results;

linter.validate = function(conf) {
    results = {
        missing_authors: 0
    };
    validateAuthor(conf);
    return results;
};

function validateAuthor(conf) {
    var struct = structure.generate(conf);
    const map = new SiteStruct(conf, struct)
}

var SiteStruct = function (conf, structure) {
    this.stripper = remark().use(strip);
    structure.sections.map(section => {
        traverse(section, this);
    })
};

SiteStruct.prototype.verifyAuthor = function (article) {
    if (article.author === undefined) {
        log(article.url)
    }
};

function traverse(node, map) {
    node.children.forEach(child => {
        switch(child.type) {
            case structure.TYPE.CATEGORY:
                if (child.children.length > 0) {
                    traverse(child, map);
                }
                break;
            case structure.TYPE.ARTICLE:
                map.verifyAuthor(child);
                break;
        }
    })
}

function log(baseLink) {
    results.missing_authors++;
    console.log(colours.red('MISSING AUTHOR: \t' + colours.underline(baseLink)));
}