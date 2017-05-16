#!/usr/bin/env node

var argv = process.argv;
var command = argv[2];
var commands = {
    lash: function (from, to) {
        var path = require('path');
        var cwd = process.cwd();
        return require('./lash')(from[0] === '/' ? from : path.join(cwd, from), to[0] === '/' ? to : path.join(cwd, to));
    }
};
var cmd = commands[command];
if (!cmd) {
    return console.log('unknown command');
}
cmd.apply(null, argv.slice(3));