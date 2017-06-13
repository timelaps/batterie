module.exports = stat;
var fs = require('fs');
var path = require('path');
function stat(p, inroot) {
    return new Promise(function (success, failure) {
        fs.stat(p, function (err, stat) {
            if (err) {
                failure(err);
            } else {
                var basename = path.basename(p);
                success({
                    stat: stat,
                    path: p,
                    base: basename,
                    rel: path.relative(inroot, p),
                    half: path.relative(inroot, p)
                });
            }
        });
    });
}