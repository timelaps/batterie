var forEach = require('./utils/for-each');
var defaultValidators = require('./default-validators');
var ExpectationConstructorCreator = require('./Expectation');
var It = require('./It');
var callItem = require('./utils/call-item');
var logError = require('./utils/log-error');
var wraptry = require('./utils/wrap-try');
var isArray = Array.isArray;
var counter = 0;
Batterie.prototype = {
    construct: construct,
    forEach: forEach,
    FORCE_TIMEOUT: 5000,
    addValidator: function () {
        var E = this.Expectation;
        return E.addValidator.apply(E, arguments);
    },
    serial: function (name, runner, expects) {
        return this.it(name, runner, {
            expects: expects,
            async: true,
            serial: true
        });
    },
    async: function (name, runner, expects) {
        return this.it(name, runner, {
            expects: expects,
            async: true
        });
    },
    sync: function (name, runner, expects) {
        return this.it(name, runner, {
            expects: expects,
            async: false
        });
    },
    curry: function (a, method, b) {
        var batterie = this;
        return function (t) {
            t.expect(a)[method](b);
        };
    },
    it: function it(testName, runner, options) {
        var key;
        var batterie = this;
        if (isArray(testName) || isArray(runner)) {
            return flutter(batterie, testName, runner, options);
        }
        var tasks = batterie.tasks;
        var nameStack = batterie.testNames.concat([testName]);
        var it = new It(batterie, nameStack, runner, typeof options === 'number' ? {
            expects: options
        } : options);
        var its = batterie.its;
        its.every.push(it);
        if (it.async) {
            key = it.serial ? 'serial' : 'parallel';
            its.async[key].push(it);
            tasks.async[key].push(runns);
        } else {
            its.sync.push(it);
            tasks.sync.push(runns);
        }
        batterie.flush();

        function runns(next) {
            if (it.async) {
                setTimeout(actualRunner);
            } else {
                actualRunner();
            }

            function actualRunner() {
                it.run(function () {
                    if (it.expectations.anyFailed) {
                        its.failed.push(it);
                    } else {
                        its.passed.push(it);
                    }
                    next();
                });
            }
        }
    },
    flush: function flush() {
        var synctasks, task, parallel, counter, batterie = this,
            its = batterie.its,
            tasks = batterie.tasks,
            async = tasks.async,
            sync = tasks.sync;
        if (sync.length) {
            tasks.sync = [];
            forEach(sync, callItem(function () {}));
        }
        if (!batterie.finished) {
            return;
        }
        if (batterie.busy) {
            return;
        } else {
            if ((parallel = async.parallel).length) {
                async.counter = 1;
                async.parallel = [];
                forEach(parallel, function (task) {
                    async.counter++;
                    task(function () {
                        async.counter--;
                        check();
                    });
                });
                async.counter--;
                check();
                return;
            } else if (!async.counter) {
                task = async.serial.shift() || tasks.after.shift();
                if (!task) {
                    batterie.busy = false;
                    return;
                }
                task(function () {
                    batterie.busy = false;
                    batterie.flush();
                });
            }

            function check() {
                if (async.counter) {
                    return;
                }
                batterie.busy = false;
                batterie.flush();
            }
        }
    },
    finish: function finish() {
        var batterie = this;
        batterie.finished = true;
        batterie.flush();
        return {
            then: function (forlater) {
                batterie.handlers.finish.push(forlater);
                batterie.tasks.after.push(function () {
                    emptyFinishers(batterie);
                });
                batterie.flush();
                return batterie;
            }
        };
    },
    describe: function describe(prefix, fn) {
        this.testNames.push(prefix);
        wraptry(fn, logError);
        this.testNames.pop();
    },
    loggers: {
        basic: require('./loggers/basic')
    },
    logger: function (key) {
        return this.loggers[key] || this.loggers.basic;
    }
};
module.exports = construct();

function construct() {
    return new Batterie();
}

function flutter(batterie, prefix, array, fn, count) {
    if (isArray(prefix)) {
        // if the first is an array, then go through again
        forEach(prefix, function (item) {
            batterie.flutter(item[0], item[1], item[2], item[3]);
        });
    } else {
        batterie.describe(prefix, function () {
            forEach(array, testThisRound(batterie, fn, count));
        });
    }
}

function Batterie() {
    var batterie = this;
    batterie.global = !(counter++);
    batterie.handlers = {
        passed: [],
        failed: [],
        missed: [],
        every: [],
        finish: []
    };
    batterie.testNames = [];
    batterie.its = {
        every: [],
        passed: [],
        failed: [],
        missed: [],
        sync: [],
        async: {
            parallel: [],
            serial: []
        }
    };
    batterie.tasks = {
        sync: [],
        after: [],
        async: {
            parallel: [],
            serial: []
        }
    };
    batterie.expectations = {
        passed: [],
        failed: [],
        missed: [],
        every: [],
        async: [],
        sync: []
    };
    batterie.failed = pushes(batterie.handlers.failed);
    batterie.missed = pushes(batterie.handlers.missed);
    batterie.every = pushes(batterie.handlers.every);
    batterie.passed = pushes(batterie.handlers.passed);
    batterie.Expectation = ExpectationConstructorCreator();
    defaultValidators(batterie.Expectation);
    batterie.busy = false;
    return batterie;
};

function emptyFinishers(bat) {
    var finishers;
    if (bat.finished) {
        finishers = bat.handlers.finish.slice(0);
        bat.handlers.finish = [];
        forEach(finishers, callItem(bat));
    }
}

function testThisRound(batterie, fn, count) {
    return function (array) {
        var message = array[0];
        var sliced = array.slice(1);
        var countIsFn = isFunction(count);
        var first = sliced[0];
        if (sliced.length > 1) {
            runSlice(sliced);
        } else {
            forEach(isArray(first) ? first : [first], runSlice);
        }

        function runSlice(sliced) {
            var args, c = countIsFn ? count.apply(this, sliced) : count;
            if (fn) {
                batterie.it(message, function (t) {
                    var args = Array.apply(null, arguments);
                    fn.apply(t, [t].concat(sliced, args));
                }, c);
            } else {
                if (isFunction(sliced)) {
                    batterie.it(message, sliced, c);
                } else {
                    batterie.it(message, function (t) {
                        t.expect(sliced[0]).toEqual(sliced[1]);
                    }, c);
                }
            }
        }
    };
}

function isFunction(fn) {
    return typeof fn === 'function';
}

function pushes(array) {
    return function (fn) {
        array.push(fn);
    };
}