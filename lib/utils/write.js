module.exports = output;
var stdout_ = process.stdout;
var stdout = stdout_ || {
    write: function (a) {
        console.log(a);
    },
    cursorTo: console && console.clear && !console.hasOwnProperty('clear') ? function () {
        console.clear();
    } : function () {}
};

function output(out, REWRITABLE_LOG) {
    if (REWRITABLE_LOG === false) {
        return stdout.write(out + '\n');
    }
    stdout.cursorTo(0, 0);
    var string = (stdout_ ? '\x1Bc' : '') + out + '\n';
    stdout.write(string);
}