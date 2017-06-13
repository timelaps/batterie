module.exports = folder;
var stats = require('./stats');
var readdirNoHidden = require('./readdir-no-hidden');

function folder(p, inroot, callback) {
    return readdirNoHidden(p).then(function (list) {
        return stats(list, inroot);
    }).then(function (files) {
        var promises = files.map(function (file) {
            if (file.stat.isDirectory()) {
                return folder(file.path, inroot, callback);
            } else {
                return callback(file);
            }
        });
        return Promise.all(promises);
    });
}