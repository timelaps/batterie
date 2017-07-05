var forEach = require('./utils/for-each');
var defaultValidators = require('./default-validators');
var ExpectationConstructorCreator = require('./Expectation');
var It = require('./It');
var callItem = require('./utils/call-item');
var wraptry = require('./utils/wrap-try');
var toArray = require('./utils/to-array');
var write = require('./utils/write');
var isArray = Array.isArray;
var createProps = require('./utils/create-props');
var isString = require('./utils/is/string');
var counter = 0;
Batterie.prototype = {
    Batterie: Batterie,
    construct: construct,
    forEach: forEach,
    FORCE_TIMEOUT: 5000,
    REWRITABLE_LOG: true,
    addValidator: function () {
        var E = this.Expectation;
        return E.addValidator.apply(E, arguments);
    },
    addItRedirect: function (key, runner) {
        this.itRedirects.methods[key] = runner;
    },
    removeItRedirect: function (key) {
        delete this.itRedirects.methods[key];
    },
    serial: function (name, runner, expects) {
        return this.it(name, runner, createProps(expects, {
            async: true,
            serial: true
        }));
    },
    resolve: function (name, fn, expects) {
        var batterie = this;
        var options = createProps(expects, {
            expects: 0,
            async: true,
            serial: false,
            autoExpect: 1
        });
        return batterie.it(name, function (t) {
            return fn.apply(this, arguments).then(function (value) {
                t.expect(true).toBeTrue();
                return value;
            }).catch(function (err) {
                batterie.log(err);
                throw err;
            });
        }, options);
    },
    async: function (name, runner, expects) {
        return this.it(name, runner, createProps(expects, {
            async: true
        }));
    },
    sync: function (name, runner, expects) {
        return this.it(name, runner, createProps(expects, {
            async: false
        }));
    },
    expect: function (a, test, b) {
        if (test) {
            this.it(this.itRedirects.keys[test] || test, runner);
        }
        return Pseudo(a, this);

        function runner(t) {
            t.expect(a)[test](b);
        }
    },
    curry: function expect(a, method, b) {
        var batterie = this;
        return function (t) {
            t.expect(a)[method](b);
        };
    },
    it: function it(testName, runner, options_) {
        var shortcut, key;
        var options = options_;
        var batterie = this;
        if (isArray(testName) || isArray(runner)) {
            return flutter(batterie, testName, runner, options);
        }
        var itRedirects = batterie.itRedirects;
        if (!itRedirects.shortcutting[testName] && (shortcut = itRedirects.methods[testName])) {
            itRedirects.shortcutting[testName] = true;
            return shortcut.apply(this, arguments);
        }
        var tasks = batterie.tasks;
        var nameStack = batterie.testNames.concat(testName ? [testName] : []);
        // var opts = createProps(options, {
        //     autoExpect: 0,
        //     expects: 1,
        //     serial: false,
        //     async: false
        // });
        var it = new It(batterie, nameStack, runner, options);
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
                task = async.serial.shift() || tasks.finish.shift();
                if (!task) {
                    batterie.busy = false;
                    return;
                }
                task(function () {
                    batterie.busy = false;
                    batterie.flush();
                });
            }
        }

        function check() {
            if (async.counter) {
                return;
            }
            batterie.busy = false;
            batterie.flush();
        }
    },
    finish: function finish() {
        var batterie = this;
        batterie.finished = true;
        batterie.flush();
        return {
            then: function (forlater) {
                batterie.handlers.finish.push(forlater);
                batterie.tasks.finish.push(function () {
                    emptyFinishers(batterie);
                });
                batterie.flush();
                return batterie;
            }
        };
    },
    describe: function describe(prefix, fn) {
        var batterie = this;
        var tasks = batterie.tasks;
        var before = tasks.before;
        var after = tasks.after;
        before.push([]);
        after.push([]);
        batterie.testNames.push(prefix);
        wraptry(fn, handleError);
        before.pop();
        after.pop();
        batterie.testNames.pop();

        function handleError(e) {
            batterie.descriptions.errors.push({
                pretty: function () {
                    return e;
                }
            });
        }
    },
    loggers: {
        basic: require('./loggers/basic')
    },
    log: function (str) {
        return this.write('results', true, str);
    },
    unlog: function (str) {
        return this.write('results', false, str);
    },
    logger: function (key) {
        var b = this;
        var logger = (b.loggers[key] || b.loggers.basic)(b);
        return function () {
            var results = logger.apply(this, arguments);
            b.write('results', results);
        };
    },
    write: function (key, bool, it) {
        var index, messages = this.messages;
        if (bool) {
            if (isArray(bool)) {
                messages[key] = messages[key].concat.apply(messages[key], bool);
            } else {
                if (isString(bool)) {
                    messages[key].push(bool);
                } else {
                    messages[key].push(it);
                }
            }
        } else {
            if (bool === false) {
                index = messages[key].indexOf(it);
                messages[key].splice(index, 1);
            }
        }
        write([].concat( //
            messages.errors, //
            messages.running, //
            messages.results).join('\n'), this.REWRITABLE_LOG);
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
    batterie.messages = {
        running: [],
        errors: [],
        results: []
    };
    batterie.handlers = {
        passed: [],
        failed: [],
        missed: [],
        every: [],
        finish: [],
        skipped: []
    };
    batterie.testNames = [];
    batterie.its = {
        every: [],
        running: [],
        passed: [],
        failed: [],
        missed: [],
        erred: [],
        sync: [],
        skipped: [],
        async: {
            parallel: [],
            serial: []
        }
    };
    batterie.tasks = {
        sync: [],
        before: [
            []
        ],
        after: [
            []
        ],
        finish: [],
        async: {
            parallel: [],
            serial: []
        }
    };
    batterie.descriptions = {
        errors: []
    };
    batterie.expectations = {
        passed: [],
        failed: [],
        missed: [],
        every: [],
        async: [],
        sync: [],
        skipped: []
    };
    batterie.itRedirects = {
        methods: {},
        shortcutting: {},
        keys: {}
    };
    batterie.before = addTask('before');
    batterie.after = addTask('after');
    batterie.beforeSync = addTask('before', syncModifier);
    batterie.afterSync = addTask('after', syncModifier);
    batterie.failed = pushes(batterie.handlers.failed);
    batterie.missed = pushes(batterie.handlers.missed);
    batterie.every = pushes(batterie.handlers.every);
    batterie.passed = pushes(batterie.handlers.passed);
    batterie.Expectation = ExpectationConstructorCreator();
    defaultValidators(batterie.Expectation);
    batterie.busy = false;
    return batterie;
}

function syncModifier(fn) {
    return function (t) {
        try {
            fn.apply(this, arguments);
            t.done();
        } catch (e) {
            t.error(e);
        }
    };
}

function addTask(key, mod_) {
    var mod = mod_ || function (fn) {
        return fn;
    };
    return function (task) {
        var tasks = this.tasks[key];
        var last = tasks[tasks.length - 1];
        last.push(mod(task));
    };
}

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

function Pseudo(a, batterie) {
    var validator, i = 0,
        Expectation = batterie.Expectation,
        validators = Expectation.validators,
        obj = {};
    for (; i < validators.length; i++) {
        validator = validators[i];
        obj[validator] = stringit(validator);
    }
    return obj;

    function stringit(key) {
        return function (b) {
            batterie.it(key, function (t) {
                t.expect(a)[key](b);
            });
        };
    }
}
