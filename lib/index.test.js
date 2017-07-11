var b = require('.');
b.describe('Batterie', function () {
    b.it('exports an instance', function (t) {
        t.expect(b).toBeObject();
    });
    b.it('can create another instance', function (t) {
        t.expect(b.construct()).toBeInstance(b.Batterie);
    });
    b.it('has an it function', function (t) {
        t.expect(b.it).toBeFunction();
    });
    b.it('has a describe function', function (t) {
        t.expect(b.describe).toBeFunction();
    });
    b.it('has a expect function', function (t) {
        t.expect(t.expect).toBeFunction();
    });
    b.it('has a hash of log functions', function (t) {
        t.expect(b.logger()).toBeFunction();
    });
    var bool = true;
    b.sync('will run synchronously', function (t) {
        t.expect(bool).toBeTrue();
    });
    bool = false;
    b.async('will run the test async', function (t) {
        setTimeout(function () {
            t.expect(bool).toBeTrue();
            t.done();
        }, 1000);
    });
    b.sync('expect sync tasks registered after async tasks to run sync', function (t) {
        t.expect(bool).toBeFalse();
    });
    bool = true;
    b.it('can have more than one expectation', function (t) {
        t.expect(true).toBeTrue();
        t.expect(false).toBeFalse();
    }, 2);
    b.it('can handle throwing fns', function (t) {
        t.expect(function () {
            throw {};
        }).toThrow();
    });
    b.it('also does batteries', [
        ['these are a series of synchronously executed tests', true, true],
        ['which are executed with the toEqual method', false, false],
        ['as proven by this it call', {}, {}]
    ]);
    b.it('also handles multiple tests at once and runs them sync', [
        ['when there is no third item in this array', [
            [1, 2],
            [4, 5],
            [10, 11],
            [1000, 1001]
        ]]
    ], function (t, x, y) {
        t.expect(x + 1).toBe(y);
    });
    b.it('expectations return objects about their status', function (t) {
        var res;
        var result = t.expect(true).toBeTrue();
        t.expect(result.valueOf()).toBeTrue();
        result.then(function () {
            res = true;
        });
        t.expect(res).toBeTrue();
        result.eitherway(function () {
            res = false;
        });
        t.expect(res).toBeFalse();
        result.otherwise(function () {
            res = true;
        });
        t.expect(res).toBeFalse();
    }, 5);
    b.it('can add new expectation validators', function (t) {
        var expects = t.expect(new Class());
        var has = expects.toBeClass;
        b.addValidator('toBeClass', function (expectation) {
            return expectation instanceof Class;
        });
        var newHas = expects.toBeClass;
        expects.toBeClass();
        t.expect(has).toBeUndefined();
        t.expect(newHas).toBeFunction();

        function Class() {}
    }, 3);
    b.it('can curry tests', [
        ['with any method available', b.curry(true, 'toBeTrue')],
        ['even the ones that were just added', b.curry(null, 'notToBeClass')]
    ]);
    b.it('allows for inverted-non scoped chaining');
    b.expect(1).toBe(1);
    b.async('can return promise', function (t) {
        return timeout(100).then(function () {
            t.expect(1).toBe(1);
        });
    });
    b.it('understands deep objects', function (t) {
        t.expect({
            one: [1],
            two: [2, 1]
        }).skip().toEqual({
            one: 2,
            two: [3, 4]
        });
    });
    b.skip('you can even skip its', function () {
        throw new Error('didn\'t skip me');
    });
    b.describe('sync pre and append functions', function () {
        var val = 0;
        b.beforeSync(function (t) {
            val++;
        });
        b.it('can have runners before', function (t) {
            t.expect(val).toBe(1);
        });
        b.afterSync(function (t) {
            val++;
        });
        b.it('should not have hit the after function', function (t) {
            t.expect(val).toBe(2);
        });
        b.it('should have hit the after function now', function (t) {
            t.expect(val).toBe(4);
        });
    });
    b.describe('creates an auto resolved test when a thennable is returned', function () {
        b.resolve('a simple resolution', function (t) {
            return Promise.resolve();
        });
        b.resolve('multiple expectations can be had too', function (t) {
            return Promise.resolve(!0).then(function (result) {
                t.expect(result).toBeTrue();
                t.expect(result).toBeTrue();
            });
        }, 2);
    });
    b.describe('shortcut methods make developing even faster', function () {
        b.resolve('shortcuts in action', function (t) {
            return Promise.resolve(true).then(t.expect.toBeTrue);
        }, 1);
    });

    function timeout(time) {
        return new Promise(function (s, f) {
            return setTimeout(function () {
                s();
            }, time);
        });
    }
});
// create reporter plugins
b.finish().then(b.logger());