module.exports = output;
var stdout = process.stdout;
var put = [];

function output(out, line) {
    stdout.cursorTo(0, 0);
    put[line || 0] = out;
    stdout.write('\x1Bc' + put.join('\n') + '\n');
}