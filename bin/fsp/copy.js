module.exports = copy;
var read = require('./read');
var path = require('path');
var write = require('./write');
var ensurePath = require('./ensure-path');

function copy(input, output, transformer) {
    return read(input).then(function (content) {
        return ensurePath(path.dirname(output)).then(function () {
            return transformer ? transformer(content) : content;
        });
    }).then(function (file) {
        return write(output, file);
    });
}
