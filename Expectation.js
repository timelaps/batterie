var forEach = require('./for-each');
module.exports = Expectation;
Expectation.prototype = {
    finished: expectationFinished
};
Expectation.defaultSuccessMessage = defaultSuccessMessage;
Expectation.defaultFailureMessage = defaultFailureMessage;
Expectation.addValidator = function addValidator(name, fn, successmessage_, failuremessage_) {
    var successmessage = !failuremessage_ ? successmessage_(defaultSuccessMessage) : successmessage_;
    var failuremessage = !failuremessage_ ? successmessage_(defaultFailureMessage) : failuremessage_;
    console.log(fn, successmessage, failuremessage);
    Expectation.prototype[name] = wrapExpector(fn, successmessage, failuremessage);
};

function Expectation(parent, a) {
    var expectation = this;
    expectation.it = parent;
    expectation.groupindex = parent.expectations.length;
    expectation.name = parent.name.slice(0).join(' ');
    expectation.a = a;
    expectation.successful = false;
    expectation.ran = false;
}

function defaultSuccessMessage(a, b) {
    return 'found ' + a + ' to be strictly equal to ' + b;
}

function defaultFailureMessage(a, b) {
    return 'expected ' + a + ' to be strictly equal to ' + b;
}

function expectationFinished(passed, successmessage, failuremessage) {
    var message, handlers, expectation = this,
        globl = expectation.it.global,
        calls = callHandler(expectation);
    if (passed) {
        message = successmessage(expectation);
        globl.success.push(expectation);
        handlers = globl.successHandlers;
    } else {
        console.log(arguments);
        message = failuremessage(expectation);
        globl.failed.push(expectation);
        handlers = globl.failedHandlers;
    }
    expectation.message = message;
    expectation.pretty = expectation.name + '\n\t#' + (expectation.groupindex + 1) + ' ' + expectation.message;
    forEach(handlers, calls);
    forEach(globl.everyHandlers, calls);
    return passed;
}

function wrapExpector(fn, successmessage, failuremessage) {
    return function (b) {
        var expectation = this;
        if (expectation.ran) {
            throw new Error('expectations can only be run once');
        }
        expectation.ran = true;
        expectation.b = b;
        return expectation.finished(fn(expectation.a, b), successmessage, failuremessage);
    };
}

function callHandler(expectation) {
    return function (handler) {
        handler(expectation);
    };
}