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
var test = Batterie.construct();
```

to check your code simply scope as many descriptions as you like and terminate with it statements. Just as you are used to with jasmine or mocha. Except you don't have to muddy up the global scope to use it.
```javascript
var ac = new AClass();
b.describe('This Framework', function () {
    // repeating code
    b.describe('Some Test Point', function () {
        b.it('should do this thing', function (t) {
            t.expect(ac.fn1()).toBe(1);
        });
        b.it('and this other thing', function (t) {
            t.expect(ac.fn2()).toBe(2);
        });
        b.it('and also this other thing', function (t) {
            t.expect(ac.fn3()).toBeFunction();
        });
    });
});
```

There are also async, serial, and resolve statements

The order of execution is as follows:

* sync ( the `it` method )
* async ( the `async` and `resolve` methods)
* serial ( the `serial` method)

For example

```javascript
var b = require('@timelaps/batterie');
var Classy = require('@timelaps/classy');
b.describe('Classy', function () {
    // if this errors it will be caught and shown
    var classy = Class();
    b.describe('methods', function () {
        b.it('a synchonous method', function (t) {
            t.expect(classy.children()).toBeEmptyArray();
        });
        b.async('an async method', function (t) {
            classy.on('customeventasync', function (e) {
                t.expect(e).toBeObject();
                t.success();
            });
            classy.on('error', function () {
                t.error();
            });
            setTimeout(function () {
                classy.dispatch('customeventasync');
            });
        });
        // this could finish before b.async's test
        // because it is also async
        b.resolve('returns a thennable', function (t) {
            // if then is called first then success
            // if catch is called first then error
            return classy.load();
        });
        b.serial('run last', function () {
            return classy.ready();
        });
        // pass in a number to tell batterie how many expectations to expect
        b.it('runs after the first it because it is synchronous', function (t) {
            t.expect(classy.parent).toBeObject();
            t.expect(classy.siblings).toBeArray();
        }, 2);
    });
});
```