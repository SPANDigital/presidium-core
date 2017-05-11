const fs = require('fs');
const cheerio = require('cheerio');
const colours = require('colors/safe');

const paths = new Set();
const htmlFiles = new Set();

const results = {
    valid : 0,
    broken: 0,
    warning: 0,
    external: 0,
    total: 0
};

let distSitePath = "";

var links = module.exports;

links.validate = function(conf) {
    distSitePath = conf.distSitePath;
    traverseDirectory(distSitePath);
    paths.add(conf.baseUrl).add('/');
    validateLinks(conf.baseUrl);
    return results;
};

function traverseDirectory(dir) {

    let list = fs.readdirSync(dir);

    list.forEach(function(file) {
        file = dir + '/' + file;
        let stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            paths.add(file.replace(distSitePath, '') + '/');
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
        $('#presidium-content section a').each(function(i, link){
            links.add($(link).attr('href'))
        });
    }
    return links;
}

function anchorValid(dir, path) {

    const data = path.split('#');
    const file = data[0].lastIndexOf('/') === data[0].length - 1 ? data[0] : data[0] + '/';
    const anchor = data[1];

    if(paths.has(file)) {
        let $ = cheerio.load(fs.readFileSync(dir + file + 'index.html'));

        return $('.anchor#' + anchor).length > 0;
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
        if(link === "") {
            log('warning', baseLink, 'empty href defined')
        } else if(baseUrl === baseLink) {
            log('valid', baseLink)
        } else if(link.indexOf('/') === 0) {
            if(link.indexOf('#') > -1) {
                if(anchorValid(distSitePath, link)) {
                    if(link.indexOf('/#') > -1) {
                        log('valid', baseLink)
                    } else {
                        log('warning', baseLink, ' is missing a \'/\' before the \'#\', but might still work')
                    }
                } else {
                    log('broken', baseLink)
                }
            } else {
                if(link.lastIndexOf('/') === link.length - 1 && paths.has(link)) {
                    log('valid', baseLink)
                } else {
                    if(paths.has(link + '/')) {
                        log('warning', baseLink, ' is missing a trailing \'/\', but might still work')
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



