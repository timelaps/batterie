module.exports = findEmpty;
var fsp = require('./fsp');
var path = require('path');

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
        var files = contents.filter(function (file) {
            return !file.content;
        }).map(function (file) {
            return file.path;
        }).sort();
        var base = files.reduce(function (memo, file) {
            return memo ? commonBase(memo, file) : path.dirname(file);
        });
        return {
            files: files,
            base: base
        };
    }).then(function (result) {
        console.log(result.base);
        console.log(result.files.map(function (file) {
            return '\t' + path.relative(result.base, file);
        }).join('\n'));
    }).catch(function (err) {
        console.log(err);
    });

    function commonBase(base, file) {
        var filebase = path.dirname(file);
        var basesplit = base.split('/');
        var filebasesplit = filebase.split('/');
        if (basesplit.length > filebasesplit.length) {
            basesplit = basesplit.slice(0, filebasesplit.length);
        } else if (basesplit.length < filebasesplit.length) {
            filebasesplit = filebasesplit.slice(0, basesplit.length);
        }
        var i = basesplit.length;
        while (i) {
            i--;
            if (basesplit[i] !== filebasesplit[i]) {
                basesplit = basesplit.slice(0, i);
            }
        }
        return basesplit.join('/');
    }

    function pushIndexes(file) {
        var rel;
        if (file.base === 'index.test.js') {
            list.push(file.path);
        }
    }
}