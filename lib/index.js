var forEach = require('./utils/for-each');
var defaultValidators = require('./default-validators');
var reduce = require('./utils/reduce');
var ExpectationConstructorCreator = require('./Expectation');
var It = require('./It');
var callItem = require('./utils/call-item');
var wraptry = require('./utils/wrap-try');
var toArray = require('./utils/to-array');
var write = require('./utils/write');
var isArray = Array.isArray;
var createProps = require('./utils/create-props');
var isString = require('./utils/is/string');
var messagesLogger = require('./loggers/messages');
var summaryLogger = require('./loggers/summary');
var artfulLogger = require('./loggers/artful');
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
    redirects: function () {
        var b = this;
        var instances = b.instances;
        var redirects = instances.redirects = instances.redirects = (function () {
            var methods = {};
            var using = {};
            return {
                get: function (key) {
                    return methods[key];
                },
                has: function (key) {
                    return !!methods[key];
                },
                call: function (key, context, args) {
                    if (using[key]) {
                        return;
                    }
                    using[key] = true;
                    var method = methods[key];
                    var result = method && method.apply(context, args);
                    using[key] = false;
                    return result;
                },
                add: function (key, fn) {
                    methods[key] = fn;
                },
                remove: function (key) {
                    delete methods[key];
                }
            };
        }());
        return redirects;
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
            resolve: true
        });
        return batterie.it(name, fn, options);
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
            this.it(this.redirects().get(test) || test, runner);
        } else {
            return Pseudo(a, this);
        }

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
    skip: function (message, fn, options) {
        return this.it(message, fn, createProps(options, {
            skip: true
        }));
    },
    it: function it(testName, runner, options_) {
        var shortcut, key;
        var options = options_;
        var batterie = this;
        if (isArray(testName) || isArray(runner)) {
            return flutter(batterie, testName, runner, options);
        }
        var redirects = batterie.redirects();
        if (redirects.has(testName)) {
            return redirects.call(testName, this, arguments);
        }
        var nameStack = batterie.testNames.concat(testName ? [testName] : []);
        var it = new It(batterie, nameStack, runner, options);
        batterie.flush();
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
            then: function (laters) {
                var forlater = resolveAllLoggers(laters, batterie);
                var finishers = batterie.handlers.finish;
                finishers.push.apply(finishers, forlater);
                batterie.tasks.finish.push(function () {
                    var emptied = emptyFinishers(batterie);
                    batterie.write('results', [].concat.apply([], emptied));
                });
                batterie.flush();
                return batterie;
            }
        };
    },
    capture: function (fn) {
        var batterie = this;
        return wraptry(fn, handleError);

        function handleError(e) {
            batterie.descriptions.errors.push({
                pretty: function () {
                    return e && e.stack ? e.stack : e;
                }
            });
            return e;
        }
    },
    describe: function describe(prefix, fn) {
        var batterie = this;
        var tasks = batterie.tasks;
        var before = tasks.before;
        var after = tasks.after;
        before.push([]);
        after.push([]);
        batterie.testNames.push(prefix);
        batterie.capture(fn);
        before.pop();
        after.pop();
        batterie.testNames.pop();
    },
    loggers: {
        basic: function () {
            return ['artful', 'summary', 'messages'];
        },
        messages: messagesLogger,
        summary: summaryLogger,
        artful: artfulLogger
    },
    log: function (str) {
        return this.write('results', true, str);
    },
    unlog: function (str) {
        return this.write('results', false, str);
    },
    logger: function (key) {
        var b = this;
        return (b.loggers[key] || b.loggers.basic)(b);
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

function resolveAllLoggers(laters, batterie) {
    return laters ? reduce(toArray(laters), resolveLoggers(batterie), []) : [];
}

function resolveLoggers(batterie) {
    var loggers = batterie.loggers;
    return function (current, item) {
        if (isString(item)) {
            var logger = loggers[item];
            if (isFunction(logger)) {
                return current.concat(logger);
            }
        } else if (isFunction(item)) {
            return current.concat(item);
        }
        // probably null
        return current;
    };
}

function Batterie() {
    var batterie = this;
    batterie.global = !(counter++);
    batterie.testNames = [];
    batterie.instances = {};
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
    batterie.Expectation = ExpectationConstructorCreator(It);
    defaultValidators(batterie.Expectation);
    batterie.stringify = batterie.Expectation.stringify;
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
        return forEach(finishers, callItem(bat));
    }
    return [];
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