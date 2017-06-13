module.exports = write;
var fs = require('fs');
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
