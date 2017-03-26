var forEach = require('./utils/for-each');
var callItem = require('./utils/call-item');
module.exports = construct;

function construct() {
    Expectation.prototype = {
        finished: finished,
        pretty: function () {
            var expectation = this;
            return expectation.name + '\n\t#' + (expectation.groupindex + 1) + ' ' + expectation.message;
        },
        valueOf: function () {
            return this.passed;
        },
        then: afterwards(function (expectation) {
            return expectation.valueOf();
        }),
        otherwise: afterwards(function (expectation) {
            return !expectation.valueOf();
        }),
        eitherway: afterwards(function () {
            return true;
        })
    };
    Expectation.defaultSuccessMessage = defaultSuccessMessage;
    Expectation.defaultFailureMessage = defaultFailureMessage;
    Expectation.addValidator = function addValidator(name, fn, passedmessage_, failuremessage_) {
        var passedmessage, failuremessage;
        if (!passedmessage_) {
            passedmessage = defaultWrapper(defaultSuccessMessage);
            failuremessage = defaultWrapper(defaultFailureMessage);
        } else {
            passedmessage = !failuremessage_ ? passedmessage_(defaultSuccessMessage) : passedmessage_;
            failuremessage = !failuremessage_ ? passedmessage_(defaultFailureMessage) : failuremessage_;
        }
        Expectation.prototype[name] = wrapExpector(fn, passedmessage, failuremessage);
    };
    return Expectation;

    function Expectation(it, a) {
        var expectation = this;
        expectation.it = it;
        expectation.groupindex = it.expectations.length;
        expectation.name = it.name.join(' ');
        expectation.a = a;
        expectation.passed = false;
        expectation.ran = false;
        return expectation;
    }
}

function defaultWrapper(fn) {
    return function (expectation) {
        return fn(expectation.a, expectation.b);
    };
}

function defaultSuccessMessage(a, b) {
    return 'found ' + a + ' to be strictly equal to ' + b;
}

function defaultFailureMessage(a, b) {
    return 'expected ' + a + ' to be strictly equal to ' + b;
}

function finished(passed_, passedmessage, failuremessage) {
    var message, handlers, passed = !!passed_,
        expectation = this,
        it = expectation.it,
        globl = it.global,
        calls = callItem(expectation),
        expectations = it.expectations;
    if (passed) {
        message = passedmessage(expectation);
        expectations.passed.push(expectation);
        handlers = globl.handlers.passed;
    } else {
        message = failuremessage(expectation);
        expectations.failed.push(expectation);
        handlers = globl.handlers.failed;
    }
    expectation.failed = !passed;
    expectations.anyFailed = expectations.anyFailed || !passed;
    expectation.passed = passed;
    expectation.message = message;
    forEach(handlers, calls);
    forEach(globl.handlers.every, calls);
    return expectation;
}

function afterwards(fn) {
    return function (doit) {
        if (fn(this)) {
            if (isString(doit)) {
                log(doit);
            } else {
                doit(this);
            }
        }
        return this;
    };
}

function isString(string) {
    return typeof string === 'string';
}

function wrapExpector(fn, passedmessage, failuremessage) {
    return function (b) {
        var expectation = this;
        if (expectation.ran) {
            throw new Error('expectations can only be run once');
        }
        expectation.ran = true;
        expectation.b = b;
        return expectation.finished(fn(expectation.a, b), passedmessage, failuremessage);
    };
}