# Batterie
-- the action of beating or crossing the feet or calves together during a leap or jump.

A lightweight synchronous testing library for testing your code succinctly and quickly.

Instead of repeating a bunch of code over and over again...

```javascript
var tp = new TP();
b.describe('This Framework', function () {
    // repeating code
    b.describe('Some Test Point', function () {
        b.it('should do this thing', function () {
            b.expect(tp.fn1()).toBe(1);
        });
        b.it('and this other thing', function () {
            expect(tp.fn2()).toBe(2);
        });
        b.it('but not this other thing', function () {
            expect(tp.fn3()).toBe(null);
        });
    });
});
```
Just run batterie's it method with an array instead of a function
```javascript
b.describe('This Framework', function () {
    b.it('Some Test Point', [
        ['should do this thing', tp.fn1(), 1],
        ['and this other thing', tp.fn2(), 2],
        ['but not this other thing', tp.fn3(), null]
    ]);
});
```

all of the previously outlined functions are still there (on the bat object),

you're just doing these checks without all the exta code

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

and create a new ```Batterie``` instance

```javascript
var test = Batterie();
```
