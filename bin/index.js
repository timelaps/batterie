#!/usr/bin/env node

var path = require('path');
var argv = process.argv;
var command = argv[2];
var cwd = process.cwd();
var commands = {
    lash: function (from, to) {
        return require('./lash')(from[0] === '/' ? from : path.join(cwd, from), to[0] === '/' ? to : path.join(cwd, to));
    },
    'find-empty': function (inside) {
        return require('./find-empty')(inside[0] === '/' ? inside : path.join(cwd, inside));
    },
    '--version': printVersion,
    '-v': printVersion,
    test: function (totest) {
        var relativeScriptPath = totest || mainScriptPath();
        var p = path.join(cwd, relativeScriptPath);
        require(p);
    }
};
var cmd = commands[command];
if (!cmd) {
    if (!argv[3]) {
        cmd = commands.test;
    } else {
        return console.log('unknown command');
    }
}
cmd.apply(null, argv.slice(3));

function mainScriptPath() {
    var targetjson = require(path.join(cwd, 'package.json'));
    var batt = targetjson.test;
    return batt && batt.root || 'test.js';
}

function printVersion() {
    var package = require('../package.json');
    console.log('v' + package.version);
}