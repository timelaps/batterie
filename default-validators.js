module.exports = defaultValidators;
var isArray = Array.isArray;
var wraptry = require('./utils/wrap-try');
var TOBE = 'toBe';

function defaultValidators(Expectation) {
    var trueBoolean = passAForMessage('Boolean: true'),
        falseBoolean = passAForMessage('Boolean: false'),
        undefinedPasser = passAForMessage('the value undefined'),
        nullPasser = passAForMessage('the value null'),
        nilPasser = passAForMessage('either the value null or the value undefined'),
        numberPasser = passAForMessage('of type Number'),
        functionPasser = passAForMessage('of type function'),
        objectPasser = passAForMessage('of type object'),
        arrayPasser = passAForMessage('an Array');
    Expectation.addValidator('toEqual', isEqual, passForMessage);
    Expectation.addValidator('toThrow', throws, passAForMessage('to throw'));
    Expectation.addValidator(TOBE, isStrictlyEqual, passForMessage);
    Expectation.addValidator(TOBE + 'True', isTrue, trueBoolean);
    Expectation.addValidator(TOBE + 'False', isFalse, falseBoolean);
    Expectation.addValidator(TOBE + 'Undefined', isUndefined, undefinedPasser);
    Expectation.addValidator(TOBE + 'Null', isNull, nullPasser);
    Expectation.addValidator(TOBE + 'Nil', isNil, nilPasser);
    Expectation.addValidator(TOBE + 'Number', isNumber, numberPasser);
    Expectation.addValidator(TOBE + 'Function', isFunction, functionPasser);
    Expectation.addValidator(TOBE + 'Object', isObject, objectPasser);
    Expectation.addValidator(TOBE + 'Array', isArray, arrayPasser);
    Expectation.addValidator(TOBE + 'Type', isType, combineABPrefix('of type'));
    Expectation.addValidator(TOBE + 'Nan', isNan, passAForMessage('NaN'));
    Expectation.addValidator(TOBE + 'GreaterThan', isGreaterThan, combineABPrefix('greater than'));
    Expectation.addValidator(TOBE + 'LessThan', isLessThan, combineABPrefix('less than'));
    Expectation.addValidator(TOBE + 'Decimal', isDecimal, passAForMessage('a decimal'));
    Expectation.addValidator(TOBE + 'Integer', isInteger, passAForMessage('an integer'));
    Expectation.addValidator(TOBE + 'GreaterThanEqualTo', isGreaterThanEqualTo, combineABPrefix('greater than or equal to'));
    Expectation.addValidator(TOBE + 'LessThanEqualTo', isLessThanEqualTo, combineABPrefix('less than or equal to'));
    Expectation.addValidator(TOBE + 'Instance', isInstanceOf, function (fn) {
        return function (expectation) {
            return fn(expectation.a, 'of instance ' + (expectation.b || {}).name);
        };
    });
}

function isDecimal(a) {
    return isNumber(a) && parseInt(a, 10) !== a;
}

function isInteger(a) {
    return isNumber(a) && parseInt(a, 10) === a;
}

function throws(fn) {
    return wraptry(function () {
        fn();
        return false;
    }, function () {
        return true;
    });
}

function isNan(a) {
    return a !== a;
}

function isInstanceOf(a, b) {
    return a instanceof b;
}

function combineABPrefix(prefix) {
    return function (fn) {
        return function (expectation) {
            return fn(expectation.a, prefix + ' ' + expectation.b);
        };
    };
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

function isGreaterThan(a, b) {
    return a > b;
}

function isLessThan(a, b) {
    return a < b;
}

function isGreaterThanEqualTo(a, b) {
    return a >= b;
}

function isLessThanEqualTo(a, b) {
    return a <= b;
}

function isEqual(a, b) {
    return eq(a, b, [], []);
}

function has(obj, key) {
    return obj.hasOwnProperty(key);
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

function typeOf(object) {
    return typeof object;
}

function isType(a, string) {
    return isStrictlyEqual(typeOf(a), string);
}

function isFunction(a) {
    return isType(a, 'function');
}

function isObject(a) {
    return a && isType(a, 'object');
}

function isNumber(a) {
    return isType(a, 'number');
}

function toNumber(a) {
    return +a;
}
var BRACKET_OBJECT_SPACE = '[object ';
var CONSTRUCTOR = 'constructor';
var objectToString = {}.toString;
var nativeKeys = Object.keys;

function keys(obj) {
    return nativeKeys ? nativeKeys(obj) : collectKeys(obj);
}

function collectKeys(obj) {
    var array = [];
    for (var n in obj) {
        if (has(obj, n)) {
            array.push(n);
        }
    }
    return array;
}

function createToStringResult(string) {
    return BRACKET_OBJECT_SPACE + string + ']';
}
// Internal recursive comparison function for `isEqual`.
function eq(a, b, aStack, bStack) {
    var className, areArrays, aCtor, bCtor, length, objKeys, key, aNumber, bNumber;
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) {
        return a !== 0 || 1 / a === 1 / b;
    }
    // A strict comparison is necessary because `null == undefined`.
    if (a === null || a === undefined || b === undefined || b === null) {
        return a === b;
    }
    // Unwrap any wrapped objects.
    // if (a instanceof _) a = a._wrapped;
    // if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    className = objectToString.call(a);
    if (className !== objectToString.call(b)) {
        return false;
    }
    switch (className) {
        // Strings, numbers, regular expressions, dates, and booleans are compared by value.
    case createToStringResult('RegExp'):
        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
    case createToStringResult('String'):
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
    case createToStringResult('Number'):
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        aNumber = toNumber(a);
        bNumber = toNumber(b);
        if (aNumber !== aNumber) {
            return bNumber !== bNumber;
        }
        // An `egal` comparison is performed for other numeric values.
        return aNumber === 0 ? 1 / aNumber === 1 / b : aNumber === bNumber;
    case BRACKET_OBJECT_SPACE + 'Date]':
    case BRACKET_OBJECT_SPACE + 'Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return toNumber(a) === toNumber(b);
    }
    areArrays = className === BRACKET_OBJECT_SPACE + 'Array]';
    if (!areArrays) {
        if (!isObject(a) || !isObject(b)) {
            return false;
        }
        // Objects with different constructors are not equivalent, but `Object`s or `Array`s
        // from different frames are.
        aCtor = a[CONSTRUCTOR];
        bCtor = b[CONSTRUCTOR];
        if (aCtor !== bCtor && !(isFunction(aCtor) && (aCtor instanceof aCtor) && isFunction(bCtor) && (bCtor instanceof bCtor)) && (CONSTRUCTOR in a && CONSTRUCTOR in b)) {
            return false;
        }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    // aStack = aStack || [];
    // bStack = bStack || [];
    length = aStack.length;
    while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] === a) {
            return bStack[length] === b;
        }
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    // Recursively compare objects and arrays.
    if (areArrays) {
        // Compare array lengths to determine if a deep comparison is necessary.
        length = a.length;
        if (length !== b.length) {
            return false;
        }
        // Deep compare the contents, ignoring non-numeric properties.
        while (length--) {
            if (!eq(a[length], b[length], aStack, bStack)) {
                return false;
            }
        }
    } else {
        // Deep compare objects.
        objKeys = keys(a);
        length = objKeys.length;
        // Ensure that both objects contain the same number of properties before comparing deep equality.
        if (keys(b).length !== length) return false;
        while (length--) {
            // Deep compare each member
            key = objKeys[length];
            if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
        }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
}