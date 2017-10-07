var b = require('.');
b.capture(function () {
    require('./lib/index.test.js');
});
// create reporter plugins
b.finish().then(b.logger());