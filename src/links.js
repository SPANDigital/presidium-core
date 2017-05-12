const fs = require('fs');
const cheerio = require('cheerio');
const colours = require('colors/safe');
const url = require('url');
const path = require('path');

let validPaths;
let htmlFiles;
let results;

//TODO: remove this:
let distSitePath = "";

const links = module.exports;

links.validate = function (conf) {
    validPaths = new Set();
    htmlFiles = new Set();
    results = {
        valid: 0,
        broken: 0,
        warning: 0,
        external: 0,
        total: 0
    };

    distSitePath = conf.distSitePath;
    traverseDirectory(distSitePath);
    validPaths.add('/');
    validPaths.add(path.join(conf.baseUrl, '/'));
    validateLinks(conf.baseUrl);
    return results;
};

function traverseDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        file = path.join(dir,'/', file);

        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            validPaths.add(path.join(file.replace(distSitePath, '/'), '/'));
            traverseDirectory(file);
        } else {
            if (file.indexOf('.html') > -1) htmlFiles.add(file);
        }
    });
}

function getLinks(files) {

    let links = new Set();

    for (let file of files) {
        let $ = cheerio.load(fs.readFileSync(file));
        $('#presidium-content').find('section a').each(function (i, link) {
            links.add($(link).attr('href'))
        });
    }
    return links;
}

function anchorValid(dir, anchorLink) {

    const link = url.parse(anchorLink);

    const file = path.join(link.path, '/');

    if (validPaths.has(file)) {
        let $ = cheerio.load(fs.readFileSync(dir + file + 'index.html'));

        return $('.anchor' + link.hash).length > 0;
    } else return false
}

function log(type, baseLink, message = '') {
    switch (type) {
        case 'broken' :
            results['broken']++;
            console.log(colours.red('BROKEN:  \t' + colours.underline(baseLink)));
            break;
        case 'valid' :
            results['valid']++;
            console.log(colours.blue('VALID:   \t' + colours.underline(baseLink)));
            break;
        case 'external' :
            results['external']++;
            console.log(colours.grey('EXTERNAL:\t' + colours.underline(baseLink)));
            break;
        case 'warning' :
            results['warning']++;
            console.log(colours.yellow('WARNING: \t' + colours.underline(baseLink) + '%s'), message);
            break;
    }
}

function validateLinks(baseUrl) {

    let links = getLinks(htmlFiles);
    results['total'] = links.size;

    for (let baseLink of links) {

        let link = baseLink.replace(baseUrl, '/');
        if (link === "") {
            log('warning', baseLink, 'empty href defined')
        } else if (baseUrl === baseLink) {
            log('valid', baseLink);
        } else if (link.indexOf('/') === 0) {
            if (link.indexOf('#') > -1) {
                if (anchorValid(distSitePath, link)) {
                    if (link.indexOf('/#') > -1) {
                        log('valid', baseLink)
                    } else {
                        log('warning', baseLink, ' is missing a trailing \'/\' before the \'#\'')
                    }
                } else {
                    log('broken', baseLink)
                }
            } else {
                if (link.lastIndexOf('/') === link.length - 1 && validPaths.has(link)) {
                    log('valid', baseLink)
                } else {
                    if (validPaths.has(link + '/')) {
                        log('warning', baseLink, ' is missing a trailing \'/\'')
                    } else {
                        log('broken', baseLink)
                    }
                }
            }
        } else {
            log('external', baseLink)
        }
    }
}