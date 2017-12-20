module.exports = output;
var stdout_ = process.stdout;
var stdout = stdout_ || createStdout();

function output(out, REWRITABLE_LOG) {
    if (REWRITABLE_LOG === false) {
        return stdout.write(out + '\n');
    }
    stdout.cursorTo(0, 0);
    var string = (stdout_ ? '\x1Bc' : '') + out + '\n';
    stdout.write(string);
}

function createStdout() {
    var c = console;
    var cursorTo = c && c.clear && c.hasOwnProperty('clear') ? clear : noop;
    return {
        write: write,
        cursorTo: cursorTo
    };

    function noop() {}

    function write(a) {
        c.log(a);
    }

    function clear() {
        c.clear();
    }
}