# Batterie.js

• batterie - _the action of beating or crossing the feet or calves together during a leap or jump._

A lightweight testing library for testing your code succinctly and quickly.

### Setup

```
npm install --save-dev batterie
```
once you have installed it, simply import it
```javascript
var Batterie = require('@timelaps/batterie');
// or
import Batterie from '@timelaps/batterie';
```

if you do not want to use the global instance you can create a new ```Batterie``` instance.

```javascript
var b = Batterie.construct();
```

to check your code simply scope as many descriptions as you like and terminate with it statements. Just as you are used to with jasmine or mocha. Except you don't have to muddy up the global scope to use it.
```javascript
var ac = new AClass();
b.describe('This Framework', () => {
    // repeating code
    b.describe('Some Test Point', () => {
        b.it('should do this thing', (t) => {
            t.expect(ac.fn1()).toBe(1);
        });
        b.it('and this other thing', (t) => {
            t.expect(ac.fn2()).toBe(2);
        });
        b.it('and also this other thing', (t) => {
            t.expect(ac.fn3()).toBeFunction();
        });
    });
});
```

# API
## base object

a globally object is exported

```javascript
const Batterie = require('@timelaps/batterie'); // object
```

### construct

used to create a new test batch

```javascript
const b = Batterie.construct();
```

### FORCE_TIMEOUT
use this timeout in ms to define how long batterie should wait for async tests to resolve before moving on

b.FORCE_TIMEOUT = 5000; // default

### REWRITEABLE_LOG
set this to false in order to be able to use console logs like normal. lots of logs come out since the log is rewritten with each test start and complete.

### describe
the describe method allows you to group your tests
```javascript
b.describe('a test block', (t) => {
    // tests go here
});
```

### expect -> `Expectation Object`
a shorthand for not having to create a whole test function for synchronous tests. Expectation methods are defined below.
```javascript
b.expect(1).toBeGreaterThan(0);
```

### it
new constructions have an `it` method to begin a test which takes a variety of arguments, the most basic of which is just a basic key and function.

```javascript
b.it('mytest name', (t) => {
    // write the guts of test here
});
```
The order of execution for all tests as follows:

* sync ( the `it` method )
* async ( the `async` and `resolve` methods)
* serial ( the `serial` method)

all types of tests are outlined below and can be accessed using options, but there are methods also available for readability and convenience.
```javascript
b.it('testname', (t) => {
    // test guts
}, {
    // to have more than one expectation use the expects key
    expect: 3,
    // add async boolean to run in the first batch of parallel async functions
    async: true,
    // resolve is checked for regardless of the type of test
    resolve: true,
    // runs the test after the parallel async batch and in serial with other registered serial tests
    serial: true,
    // skips the test
    skip: true
});
```
pass a number as the third argument as a shorthand to set the number of expectations
```javascript
b.it('tests many', (t) => {
    t.expect(1).toBe(1);
    t.expect(2).toBe(1);
    t.expect(3).toBe(1);
}, 3);
```
pass an array to test a series of tests without having to repeat yourself
```javascript
b.it('also does batteries', [
    ['these are a series of synchronously executed tests', true, true],
    ['which are executed with the toEqual method', false, false],
    ['as proven by this it call', {}, {}]
]);
```

### sync
runs the test synchronously. this is the default for tests. Method is available if being explicit is your jam.
```javascript
b.sync('my synchronous test', (t) => {
    t.expect('').toBeEmptyString();
});
```

### async
runs the test in a batched async methodology outlined below. An example is in the `examples` folder if you are confused by the description.
```javascript
b.async('sets async boolean for you', (t) => {
    // test guts
});
```

### serial
runs the test in serial after all parallel async tests are finished
```javascript
b.serial('serial1', () => {/* second */});
b.async('serial1', () => {/*  first  */});
b.serial('serial1', () => {/* third  */});
```

## test object
### expect
tests have expectations within them. This is useful for abstracting test functions if that is something you like to do. A test can be run just by passing a function to it or one of its derivatives.
```javascript
b.it('mytest name here', (t) => {
    t.expect(true).toBeTrue();
});
```
you can have multiple expectations
```javascript
b.it('has multiple expectations', (t) => {
    t.expect(true).toBeTrue();
    t.expect(false).toBeFalsey();
}, 2);
```

## expectation object
### methods
#### toBe
```javascript
t.expect({}).notToBe({});
t.expect(NaN).toBe(NaN);
t.expect(true).toBe(true);
var instance = {};
t.expect(instance).toBe(instance);
```
#### toBeArray
```javascript
t.expect('').notToBeArray();
t.expect([]).toBeArray();
```
#### toBeBoolean
```javascript
t.expect('').notToBeBoolean();
t.expect(false).toBeBoolean();
```
#### toBeDecimal
```javascript
t.expect(1).notToBeDecimal();
t.expect(1.44).toBeDecimal();
```
#### toBeEmpty
```javascript
t.expect([1, 2, 3]).notToBeEmpty();
t.expect({}).toBeEmpty();
```
#### toBeEmptyArray
```javascript
t.expect([1, 2, 3]).notToBeEmptyArray();
t.expect([]).toBeEmptyArray();
```
#### toBeString
```javascript
t.expect(1).notToBeString();
t.expect('1').toBeString();
```
#### toBeFalse
```javascript
t.expect(true).notToBeFalse();
t.expect(false).toBeFalse();
```
#### toBeFalsey
```javascript
t.expect({}).notToBeFalsey();
t.expect(0).toBeFalsey();
```
#### toBeFinite
```javascript
t.expect(-Infinity).notToBeFinite();
t.expect(10).toBeFinite();
```
#### toBeGreaterThan
```javascript
t.expect(2).notToBeGreaterThan(4);
t.expect(5).toBeGreaterThan(4);
```
#### toBeGreaterThanEqualTo
```javascript
t.expect(2).notToBeGreaterThanEqualTo(4);
t.expect(4).toBeGreaterThanEqualTo(4);
```
#### toBeInfinite
```javascript
t.expect(10).notToBeInfinite();
t.expect(Infinity).toBeInfinite();
```
#### toBeInstance
```javascript
t.expect(instance).notToBeInstance(DifferentConstructor);
t.expect(instance).toBeInstance(CorrectConstructor);
```
#### toBeInteger
```javascript
t.expect(1.1).notToBeInteger();
t.expect(5).toBeInteger();
```
#### toBeLessThan
```javascript
t.expect(5).notToBeLessThan(4);
t.expect(2).toBeLessThan(4);
```
#### toBeLessThanEqualTo
```javascript
t.expect(5).notToBeLessThanEqualTo(4);
t.expect(4).toBeLessThanEqualTo(4);
```
#### toBeNan
```javascript
t.expect(5).notToBeNan();
t.expect(+('here')).toBeNan();
```
#### toBeNil
```javascript
t.expect(true).notToBeNil();
t.expect(null).toBeNil();
t.expect(undefined).toBeNil();
```
#### toBeNull
```javascript
t.expect(true).notToBeNull();
t.expect(null).toBeNull();
```
#### toBeNumber
```javascript
t.expect(true).notToBeNumber();
t.expect(4).toBeNumber();
```
#### toBeObject
```javascript
t.expect('').notToBeObject();
t.expect({}).toBeObject();
```
#### toBeStrictlyEqual
```javascript
var a = {};
var b = {};
t.expect(a).notToBeStrictlyEqual(b);
t.expect(NaN).notToBeStrictlyEqual(NaN);
t.expect(a).toBeStrictlyEqual(a);
```
#### toBeString
```javascript
t.expect({}).notToBeString();
t.expect('').toBeString();
```
#### toBeThennable
```javascript
t.expect({}).notToBeThennable();
t.expect({
    then: () => {},
    catch: () => {}
}).toBeThennable();
t.expect(new Promise(() => {})).toBeThennable();
```
#### toBeTrue
```javascript
t.expect('true').notToBeTrue();
t.expect(true).toBeTrue();
```
#### toBeTruthy
```javascript
t.expect(0).notToBeTruthy();
t.expect(true).toBeTruthy();
```
#### toBeType
```javascript
t.expect(0).notToBeType('string');
t.expect(true).toBeType('boolean');
```
#### toBeUndefined
```javascript
t.expect(null).notToBeUndefined();
t.expect(undefined).toBeUndefined();
```
#### toEqual
```javascript
t.expect({
    test: true,
    passing: false
}).notToEqual({
    test: true
});
t.expect({
    test: {
        passing: true
    }
}).toEqual({
    test: {
        passing: true
    }
});
```
#### toReturn
```javascript
b.expect(undef).toReturn(); // fails

function undef() {
    return;
}
```
#### toReturnArray
```javascript
b.expect(noOneHere).toReturnArray();

function noOneHere() {
    return [];
}
```
#### toReturnString
```javascript
b.expect(getAttendence).toReturnString();

function getAttendence() {
    return 'here';
}
```
#### toThrow
```javascript
b.expect(tryAllTheThings).toThrow(); // passing test

function tryAllTheThings() {
    throw new Error('Couldn\'t do it');
}
```