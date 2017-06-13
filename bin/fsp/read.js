module.exports = read;
var fs = require('fs');
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
