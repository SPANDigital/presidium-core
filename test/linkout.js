var config = require("../src/config");
var presidium = require("../src/presidium");

describe('Section Link Out', function () {
    this.timeout(0);
    let conf;

    describe('Section Link', function () {
        before(function () {
            conf = config.load("./test/linkout/_config.yml");
            presidium.clean(conf);
            presidium.generate(conf);
            conf.distSrcPath = "./linkout/dist/src";
            conf.distSitePath = "./linkout/dist/site";
            presidium.build(conf);
        });

        it('TODO', function (done) {
            done();
        });
    });
});