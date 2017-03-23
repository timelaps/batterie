module.exports = defaultValidators;

function defaultValidators(addValidator) {
    var trueBoolean = passAForMessage('Boolean: true');
    var falseBoolean = passAForMessage('Boolean: false');
    var undefinedPasser = passAForMessage('the value undefined');
    var nullPasser = passAForMessage('the value null');
    var nilPasser = passAForMessage('either the value null or the value undefined');
    addValidator('toBe', isStrictlyEqual, passForMessage(defaultSuccessMessage), passForMessage(defaultFailureMessage));
    addValidator('toBeTrue', isTrue, trueBoolean(defaultSuccessMessage), trueBoolean(defaultFailureMessage));
    addValidator('toBeFalse', isFalse, falseBoolean(defaultSuccessMessage), falseBoolean(defaultFailureMessage));
    addValidator('toBeUndefined', isUndefined, undefinedPasser(defaultSuccessMessage), undefinedPasser(defaultFailureMessage));
    addValidator('toBeNull', isNull, nullPasser(defaultSuccessMessage), nullPasser(defaultFailureMessage));
    addValidator('toBeNil', isNil, nilPasser(defaultSuccessMessage), nilPasser(defaultFailureMessage));

    function defaultSuccessMessage(a, b) {
        return 'found ' + a + ' to be strictly equal to ' + b;
    }

    function defaultFailureMessage(a, b) {
        return 'expected ' + a + ' to be strictly equal to ' + b;
    }

    function passForMessage(fn) {
        return function (expectation) {
            return fn(expectation.a, expectation.b);
        };
    }

    function passAForMessage(def) {
        return function (fn) {
            return function (expectation) {
                return fn(expectation.a, def);
            };
        };
    }

    function isStrictlyEqual(a, b) {
        return a === b;
    }

    function isUndefined(a) {
        return isStrictlyEqual(a);
    }

    function isTrue(a) {
        return isStrictlyEqual(a, true);
    }

    function isFalse(a) {
        return isStrictlyEqual(a, false);
    }

    function isNull(a) {
        return isStrictlyEqual(a, null);
    }

    function isNil(a) {
        return isUndefined(a) || isNull(a);
    }
}