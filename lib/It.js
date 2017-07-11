var forEach = require('./utils/for-each');
var wraptry = require('./utils/wrap-try');
var callItem = require('./utils/call-item');
var toArray = require('./utils/to-array');
var now = require('./utils/now');
var createProps = require('./utils/create-props');
module.exports = It;
It.prototype = {
    error: noop,
    success: noop,
    done: noop,
    failed: noop,
    run: run,
    skipped: function () {
        if (this.addedToSkip) {
            return;
        }
        if (--this.expects === 0) {
            this.addedToSkip = true;
            this.global.its.skipped.push(this);
        }
    },
    skips: function () {
        // return this
    },
    pretty: function () {
        return this.toString();
    },
    toString: function () {
        return this.name.join(' > ');
    },
    expectation: function () {
        var it = this;
        var batterie = it.global;
        var expectations = it.expectations;
        var expt = new batterie.Expectation(it);
        expectations.every.push(expt);
        batterie.expectations.every.push(expt);
        return expt;
    },
    // expect: ,
    catch: function (fn) {
        var t = this;
        return function () {
            var context = this;
            var args = toArray(arguments);
            return wraptry(function () {
                return fn.apply(context, args);
            }, function (e) {
                t.error(e);
                throw e;
            });
        };
    }
};

function noop() {}

function isPromise(p) {
    return p && p.then && p.catch;
}

function runThen(it, key, then, catches) {
    var ran, list = it.tasks[key],
        counter = list.length + 1;
    forEach(list, function (fn) {
        var promise = fn({
            error: error,
            failure: error,
            success: proxy,
            done: proxy
        });
        if (isPromise(promise)) {
            promise.then(proxy).catch(error);
        }
    });
    proxy();

    function error(e) {
        counter = null;
        it.global.log(e);
        proxy();
    }

    function proxy(e) {
        counter--;
        if (!counter) {
            if (ran) {
                return;
            }
            ran = true;
            if (counter === counter) {
                then();
            } else {
                catches(e);
            }
        }
    }
}

function run(next) {
    var id, start, it = this,
        waitcount = 1,
        batterie = it.global;
    batterie.write('running', true, it);
    runThen(it, 'before', function () {
        it.success = it.done = finished;
        it.failed = it.error = errorFailover;
        wraptry(function () {
            var after;
            if (it.skip) {
                it.skips();
                return finished();
            }
            if (it.async) {
                waitcount++;
                triggerFinishLater();
            }
            if (it.runner) {
                it.start = now();
                after = it.runner(it);
            }
            if (isPromise(after)) {
                waitcount--;
                if (!it.async) {
                    batterie.log('Returning a thennable does not trigger batterie to treat this test (' + it.toString() + ') as asynchronous. Use async or serial to capture all async expectations.');
                }
                after.then(it.done).catch(it.error);
            } else {
                finished();
            }
        }, errorFailover);
    }, errorFailover);

    function logError(e) {
        batterie.write('errors', true, e.stack);
    }

    function triggerFinishLater() {
        id = setTimeout(function () {
            errorFailover({
                message: 'timout was met for ' + it.toString()
            });
        }, it.timeout);
    }

    function errorFailover(e) {
        waitcount = 1;
        batterie.its.erred.push(it);
        logError(e);
        finished(e);
    }

    function finished(err) {
        if (--waitcount > 0) {
            return;
        }
        // if more expectations occur put them here
        if (waitcount < 0) {
            return;
        }
        it.end = now();
        clearTimeout(id);
        it.error = err === undefined ? null : err;
        it.failed = it.error !== null;
        checkCounters(batterie, it);
        batterie.write('running', false, it);
        // it.global.log(it.name);
        runThen(it, 'after', next, function (e) {
            logError(e);
            next();
        });
    }
}

function concat(list) {
    return [].concat.apply([], list);
}

function It(batterie, nameStack, runner, options_) {
    var key, its, tasks, it = this;
    var expect = it.expect = function (value) {
        // var err = parseStack(1); // for the stack
        return this.expectation().a(value);
    };
    forEach(batterie.Expectation.validators, function (key) {
        expect[key] = function (a, b) {
            it.expect(a)[key](b);
        };
    });
    var options = createProps(options_ || {}, {
        autoExpects: 0,
        expects: 1,
        serial: false,
        async: false,
        resolve: false
    });
    tasks = batterie.tasks;
    its = batterie.its;
    it.expectations = {
        every: [],
        failed: [],
        passed: [],
        skipped: []
    };
    it.tasks = {
        before: concat(tasks.before),
        after: concat(tasks.after)
    };
    it.name = nameStack;
    it.missed = false;
    it.global = batterie;
    var resolve = it.resolve = options.resolve || false;
    it.runner = it.resolve ? resolveWrapper(runner) : runner;
    it.timeout = options.timeout || batterie.FORCE_TIMEOUT;
    it.expects = runner ? options.expects : 0;
    it.autoExpects = runner ? options.autoExpects : 0;
    if (resolve) {
        it.autoExpects += 1;
    }
    it.serial = options.serial || false;
    it.skip = options.skip || false;
    it.async = !!options.async;
    its.every.push(it);
    if (it.async) {
        key = it.serial ? 'serial' : 'parallel';
        its.async[key].push(it);
        tasks.async[key].push(runns);
    } else {
        its.sync.push(it);
        tasks.sync.push(runns);
    }
    if (it.skip) {
        its.skipped.push(it);
    }
    return it;

    function runns(next) {
        if (it.async) {
            setTimeout(actualRunner);
        } else {
            actualRunner();
        }

        function actualRunner() {
            it.run(function () {
                if (it.expectations.failed.length) {
                    its.failed.push(it);
                } else {
                    its.passed.push(it);
                }
                next();
            });
        }
    }
}

function resolveWrapper(fn) {
    return function (t) {
        return fn.apply(this, arguments).then(function (value) {
            t.expect(true).toBeTrue();
            return value;
        }).catch(function (err) {
            batterie.log(err);
            throw err;
        });
    };
}

function checkCounters(batterie, it) {
    var msd, expectations, totalExpectations;
    if (it && it.expects && !it.skip) {
        expectations = it.expectations.every;
        totalExpectations = it.expects + it.autoExpects;
        actualexpectations = expectations.length;
        if (totalExpectations !== expectations.length) {
            msd = {
                it: it,
                pretty: function () {
                    return 'MISSING: expected ' + it.toString() + ' to have ' + it.expects + ' expectations instead of ' + (actualexpectations - it.autoExpects);
                }
            };
            it.missed = true;
            batterie.its.missed.push(it);
            batterie.expectations.missed.push(msd);
            forEach(batterie.handlers.missed, callItem(msd));
        }
    }
}