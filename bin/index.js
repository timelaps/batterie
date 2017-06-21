#!/usr/bin/env node

var argv = process.argv;
var command = argv[2];
var cwd = process.cwd();
var commands = {
    lash: function (from, to) {
        var path = require('path');
        return require('./lash')(from[0] === '/' ? from : path.join(cwd, from), to[0] === '/' ? to : path.join(cwd, to));
    },
    findEmpty: function (inside) {
        var path = require('path');
        return require('./find-empty')(inside[0] === '/' ? inside : path.join(cwd, inside));
    },
    '--version': printVersion,
    '-v': printVersion
};
var cmd = commands[command];
if (!cmd) {
    return console.log('unknown command');
}
cmd.apply(null, argv.slice(3));

function printVersion() {
    var package = require('../package.json');
    console.log('v' + package.version);
}