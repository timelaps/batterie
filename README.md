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



