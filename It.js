var forEach = require('./utils/for-each');
var logError = require('./utils/log-error');
var wraptry = require('./utils/wrap-try');
var callItem = require('./utils/call-item');
var parseStack = require('./parse-stack');
It.prototype = {
    expect: function (value) {
        var err = parseStack(1); // for the stack
        var it = this;
        var batterie = it.global;
        var expectations = it.expectations;
        var expt = new batterie.Expectation(it, value);
        expectations.every.push(expt);
        batterie.expectations.every.push(expt)
        return expt;
    },
    run: function run(next) {
        var id, start, it = this,
            waitcount = 1,
            batterie = it.global;
        it.done = finished;
        it.success = finished;
        it.error = errorFailover;
        it.failed = errorFailover;
        wraptry(function () {
            var after;
            if (it.async) {
                waitcount++;
                triggerFinishLater();
                after = it.runner(it);
            } else {
                after = it.runner(it);
            }
            if (after && after.then && after.catch) {
                after.then(finished).catch(finished);
            } else {
                finished();
            }
        }, logError);

        function triggerFinishLater() {
            id = setTimeout(function () {
                errorFailover({
                    message: 'timout was met for ' + it.name.join(' ')
                });
            }, 5000);
        }

        function captureerrors(fn) {
            wraptry(fn, errorFailover);
        }

        function errorFailover(e) {
            waitcount = 1;
            finished(e);
            logError(e);
        }

        function finished(err) {
            if (--waitcount > 0) {
                return;
            }
            // if more expectations occur put them here
            if (waitcount < 0) {
                return;
            }
            clearTimeout(id);
            it.error = err === undefined ? null : err;
            it.failed = it.error !== null;
            checkCounters(batterie, it);
            next();
        }
    }
};
module.exports = It;

function It(batterie, nameStack, runner, options_) {
    var it = this;
    var options = options_ || {};
    it.expectations = {
        failed: false,
        passed: true,
        every: [],
        failed: [],
        passed: []
    };
    it.name = nameStack;
    it.expects = options.expects || 1;
    it.serial = options.serial || false;
    it.missed = false;
    it.global = batterie;
    it.runner = runner;
    it.async = !!options.async;
    return it;
}

function checkCounters(batterie, it) {
    var name, msd, expectations;
    if (it && it.expects) {
        expectations = it.expectations.every;
        if (it.expects !== expectations.length) {
            name = it.name.slice(0).join(' ');
            msd = {
                name: name,
                message: 'MISSING: expected ' + name + ' to have ' + it.expects + ' expectations instead of ' + expectations.length,
                group: it
            };
            it.missed = true;
            batterie.its.missed.push(it);
            batterie.expectations.missed.push(msd);
            forEach(batterie.handlers.missed, callItem(msd));
        }
    }
}