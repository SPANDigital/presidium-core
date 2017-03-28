const yaml = require('js-yaml');
const fs = require('fs');
const config = module.exports;

config.load = function(configFile = '_config.yml') {
    try {
        const file = fs.readFileSync(configFile, 'utf8');
        return yaml.load(file);
    } catch (e) {
        console.log(e);
    }
};