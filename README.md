# Batterie.js

• batterie - _the action of beating or crossing the feet or calves together during a leap or jump._

A lightweight testing library for testing your code succinctly and quickly.

Instead of repeating a bunch of code over and over again...

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
Just run batterie's it method with an array instead of a function
```javascript
var ac = new AClass();
b.describe('This Framework', function () {
    b.it('Some Test Point', [
        ['should do this thing', ac.fn1(), 1],
        ['and this other thing', ac.fn2(), 2],
        ['and also this other thing', b.curry(ac.fn3(), 'toBeFunction')]
    ]);
});
```

all of the previously outlined functions are still there (on the batterie instance), you're just telling batterie to iterate over the specified array and doing these checks without all the exta code

### Setup

```
npm install --save-dev batterie
```
once you have installed it, simply import it
```javascript
var Batterie = require('batterie');
// or
import Batterie from 'batterie';
```

if you do not want to use the global instance you can create a new ```Batterie``` instance.

```javascript
var test = Batterie.construct();
```
