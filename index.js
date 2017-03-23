var forEach = require('./for-each');
var defaultValidators = require('./default-validators');
var Expectation = require('./Expectation');
module.exports = function () {
    var history = [];
    var success = [];
    var failed = [];
    var missed = [];
    var failedHandlers = [];
    var missedHandlers = [];
    var successHandlers = [];
    var everyHandlers = [];
    var stalecounter;
    var testNames = [];
    var its = [];
    var whenfinished = [];
    var isArray = Array.isArray;
    var globl = {
        success: success,
        successHandlers: successHandlers,
        failed: failed,
        failedHandlers: failedHandlers,
        missed: missed,
        missedHandlers: missedHandlers,
        every: history,
        everyHandlers: everyHandlers
    };
    defaultValidators(Expectation);
    return (test = {
        failed: pushes(failedHandlers),
        missed: pushes(missedHandlers),
        every: pushes(everyHandlers),
        success: pushes(successHandlers),
        it: function it(testName, fn, counter) {
            var itInstance;
            testNames.push(testName);
            itInstance = {
                expectations: [],
                name: testNames.slice(0),
                counter: counter || 1,
                missed: false,
                global: globl
            };
            checkCounters();
            its.push(itInstance);
            wraptry(fn, logError);
            testNames.pop();
        },
        finish: function finish() {
            test.finished = true;
            checkCounters();
            return {
                then: function (forlater) {
                    whenfinished.push(forlater);
                    emptyFinishers();
                    return this;
                }
            };
        },
        describe: function describe(prefix, fn) {
            testNames.push(prefix);
            wraptry(fn, logError);
            testNames.pop();
        },
        expect: function expect(value) {
            var parentIt = currentIt();
            var crntExpectations = parentIt.expectations;
            var expt = new Expectation(parentIt, value);
            history.push(expt);
            crntExpectations.push(expt);
            return expt;
        },
        battery: function battery(prefix, array, fn, count) {
            var test = this;
            if (isArray(prefix)) {
                forEach(prefix, function (item) {
                    battery(item[0], item[1], item[2], item[3]);
                });
            } else {
                test.describe(prefix, function () {
                    forEach(array, function (item) {
                        testThisRound(test, item, fn, count);
                    });
                });
            }
        }
    });

    function emptyFinishers() {
        var finishers;
        if (test.finished) {
            finishers = whenfinished.slice(0);
            whenfinished = [];
            forEach(finishers, function (finisher) {
                finisher({
                    total: history.length,
                    history: history,
                    success: success,
                    missed: missed,
                    failed: failed
                });
            });
        }
    }

    function logError(e) {
        console.error ? console.error(e) : console.log(e);
    }

    function pushes(array) {
        return function (fn) {
            array.push(fn);
        };
    }

    function currentIt() {
        return its[its.length - 1];
    }

    function currentExpectations() {
        return currentIt().expectations;
    }

    function expectationLength() {
        return currentExpectations().length;
    }

    function testThisRound(test, array, fn, count) {
        var sliced = array.slice(1);
        var countIsFn = typeof count === 'function';
        if (sliced.length > 1) {
            runSlice(sliced);
        } else {
            forEach(sliced[0], runSlice);
        }

        function runSlice(sliced) {
            test.it(array[0], function () {
                if (fn) {
                    fn.apply(test, sliced);
                } else {
                    test.expect(sliced[0]).toBe(sliced[1]);
                }
            }, countIsFn ? count.apply(this, sliced) : count);
        }
    }

    function wraptry(fn, tries, finalies) {
        var res;
        try {
            res = fn();
        } catch (e) {
            res = tries ? tries(e) : e;
        } finally {
            res = finalies ? finalies(res) : res;
        }
        return res;
    }

    function checkCounters() {
        var name, msd, expectations, current = currentIt();
        if (current && current.counter) {
            expectations = current.expectations;
            if (current.counter !== expectations.length) {
                name = current.name.slice(0).join(' ');
                msd = {
                    name: name,
                    message: 'MISSING: expected ' + name + ' to have ' + current.counter + ' instead of ' + expectations.length,
                    group: current
                };
                current.missed = true;
                missed.push(msd);
                forEach(missedHandlers, callHandler(msd));
            }
        }
    }

    function callHandler(expectation) {
        return function (handler) {
            handler(expectation);
        };
    }
};