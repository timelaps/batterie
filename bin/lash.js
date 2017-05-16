var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
module.exports = function (inroot, position) {
    var list = [];
    var dirposition = path.dirname(position);
    var relativeBase = path.relative(dirposition, inroot) + '/';
    return folder(inroot, inroot, function (file) {
        if (file.base === 'index.test.js') {
            list.push('./' + relativeBase + file.half.slice(0, file.half.length - 3));
        }
    }).then(function () {
        return write(position, list.map(function (p) {
            return 'require(\'' + p + '\');';
        }).join('\n'));
    });
};

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
    }).catch(function (err) {
        console.log(err);
    });
}

function ensurePath(p) {
    return new Promise(function (success, failure) {
        mkdirp(p, function (err) {
            if (err) {
                failure(err);
            } else {
                success();
            }
        });
    });
}

function write(output, file) {
    return new Promise(function (success, failure) {
        fs.writeFile(output, file, function (err) {
            if (err) {
                failure(err);
            } else {
                success();
            }
        });
    });
}

function read(input) {
    return new Promise(function (success, failure) {
        fs.readFile(input, function (err, file) {
            if (err) {
                failure(err);
            } else {
                success(file);
            }
        });
    });
}

function copy(input, output, transformer) {
    return read(input).then(function (content) {
        return ensurePath(path.dirname(output)).then(function () {
            return transformer ? transformer(content) : content;
        });
    }).then(function (file) {
        return write(output, file);
    });
}

function stats(files, inroot) {
    return Promise.all(files.map(stat(inroot)));
}

function stat(inroot) {
    return function (p) {
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
    };
}

function readdirNoHidden(p) {
    return readdir(p).then(function (list) {
        return list.filter(function (name) {
            return name[0] !== '.';
        }).map(function (file) {
            return path.join(p, file);
        }).slice(0).sort();
    });
}

function readdir(p) {
    return new Promise(function (success, failure) {
        fs.readdir(p, function (err, list) {
            if (err) {
                failure(err);
            } else {
                success(list);
            }
        });
    });
}