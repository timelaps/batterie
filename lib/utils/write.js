module.exports = output;
var stdout = process.stdout;

function output(out, REWRITABLE_LOG) {
    if (REWRITABLE_LOG === false) {
        return stdout.write(out + '\n');
    }
    stdout.cursorTo(0, 0);
    stdout.write('\x1Bc' + out + '\n');
    // stdout.write(out.join('\n') + '\n');
}