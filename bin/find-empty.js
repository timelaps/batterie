module.exports = findEmpty;
var fsp = require('./fsp');

function findEmpty(inroot) {
    var list = [];
    return fsp.folder(inroot, inroot, pushIndexes).then(function () {
        return Promise.all(list.map(function (p) {
            return fsp.read(p).then(function (content) {
                return {
                    path: p,
                    content: content.toString()
                };
            });
        }));
    }).then(function (contents) {
        return contents.filter(function (file) {
            return !file.content;
        }).map(function (file) {
            return file.path;
        });
    }).then(function (files) {
        console.log(files.join('\n'));
    }).catch(function (err) {
        console.log(err);
    });

    function pushIndexes(file) {
        var rel;
        if (file.base === 'index.test.js') {
            list.push(file.path);
        }
    }
}