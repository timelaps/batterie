var forEach = require('./utils/for-each');
var callItem = require('./utils/call-item');
var isString = require('./utils/is/string');
var has = require('./utils/has');
module.exports = construct;

function construct() {
    var ExpectationFn = Expectation.prototype = {
        finished: finished,
        pretty: function () {
            var expectation = this;
            return expectation.name + ' #' + (expectation.groupindex + 1) + '\n' + expectation.message;
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
        }),
        skip: function () {
            var expectation = this;
            var it = expectation.it;
            expectation.skipping = true;
            it.skipped();
            return expectation;
        },
        a: function (value) {
            if (has(this, '_a')) {
                return this._a;
            }
            this._a = value;
            return this;
        },
        b: function (value) {
            if (has(this, '_b')) {
                return this._b;
            }
            this._b = value;
            return this;
        }
    };
    Expectation.defaultPassedMessage = defaultPassedMessage;
    Expectation.defaultPassedNotMessage = defaultPassedNotMessage;
    Expectation.addValidator = function addValidator(name, fn, passedMessage_, passedNotMessage_) {
        var passedMessage, passedNotMessage;
        if (!passedMessage_) {
            passedMessage = defaultWrapper(defaultPassedMessage);
            passedNotMessage = defaultWrapper(defaultPassedNotMessage);
        } else {
            passedMessage = !passedNotMessage_ ? passedMessage_(defaultPassedMessage) : passedMessage_;
            passedNotMessage = !passedNotMessage_ ? passedMessage_(defaultPassedNotMessage) : passedNotMessage_;
        }
        var notname = 'not' + capitalize(name);
        ExpectationFn[name] = wrapExpector(fn, passedMessage);
        ExpectationFn[notname] = wrapExpector(negate(fn), passedMessage);
        Expectation.validators.push(name);
        Expectation.validators.push(notname);
    };
    Expectation.validators = [];
    return Expectation;

    function Expectation(it) {
        var expectation = this;
        // it stuff should be moved to other side
        // or at least into a bind type function
        expectation.it = it;
        expectation.groupindex = it.expectations.every.length;
        expectation.name = it.name.join(' ');
        expectation.passed = expectation.skipped = expectation.ran = false;
        return expectation;
    }
}

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

function negate(fn) {
    return function () {
        return !fn.apply(this, arguments);
    };
}

function defaultWrapper(fn) {
    return function (expectation) {
        return fn(expectation.a(), expectation.b());
    };
}

function defaultPassedMessage(a, b) {
    return a + ' to be strictly equal to ' + b;
}

function defaultPassedNotMessage(a, b) {
    return a + ' to be strictly equal to ' + b;
}

function finished(passed_, passedMessage) {
    var handlers, key, passed = !!passed_,
        expectation = this,
        it = expectation.it,
        globl = it.global,
        calls = callItem(expectation),
        expectations = it.expectations,
        message = passedMessage(expectation);
    if (expectation.skipping) {
        key = 'skipped';
        passed = true;
        // return expectation;
    } else if (passed) {
        key = 'passed';
    } else {
        key = 'failed';
    }
    handlers = globl.handlers[key];
    expectations[key].push(expectation);
    globl.expectations[key].push(expectation);
    expectation.failed = !passed;
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

function wrapExpector(fn, passedMessage) {
    return function (b) {
        var expectation = this;
        if (expectation.ran) {
            throw new Error('expectations can only be run once');
        }
        expectation.ran = true;
        expectation.b(b);
        return expectation.finished(fn(expectation.a(), b), passedMessage);
    };
}