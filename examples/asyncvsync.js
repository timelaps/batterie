
var b = require('@timelaps/batterie');
var Classy = require('@timelaps/classy');
b.describe('Classy', () => {
    // if this errors it will be caught and shown
    var classy = Class();
    b.describe('methods', () => {
        b.it('a synchonous method', (t) => {
            t.expect(classy.children()).toBeEmptyArray();
        });
        b.async('an async method', (t) => {
            classy.on('customeventasync', (e) => {
                t.expect(e).toBeObject();
                t.success();
            });
            classy.on('error', () => {
                t.error();
            });
            setTimeout(() => {
                classy.dispatch('customeventasync');
            });
        });
        // this could finish before b.async's test
        // because it is also async
        b.resolve('returns a thennable', (t) => {
            // if internal resolve is called first then success
            // if internal reject is called first then error
            return classy.load();
        });
        // if a promise is returned in serial async will be assumed
        b.serial('run last', () => {
            return classy.ready();
        });
        // pass in a number to tell batterie how many expectations to expect
        b.it('runs after the first it because it is synchronous', (t) => {
            t.expect(classy.parent).toBeObject();
            t.expect(classy.siblings).toBeArray();
        }, 2);
    });
});