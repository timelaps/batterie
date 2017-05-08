module.exports = output;
var stdout = process.stdout;
var put = [];

function output(out, line) {
    stdout.cursorTo(0, 0);
    stdout.write('\x1Bc' + out.join('\n') + '\n');
    // stdout.write(out.join('\n') + '\n');
}