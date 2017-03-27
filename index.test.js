var b = require('.');
b.describe('Batterie', function () {
    b.it('exports an instance', function (t) {
        t.expect(b).toBeObject();
    });
    b.it('can create another instance', function (t) {
        t.expect(b.construct()).toBeInstance(b.constructor);
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
    b.it('has a battery function', function (t) {
        t.expect(b.flutter).toBeFunction();
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
        t.expect(bool).toBeTrue();
        t.done();
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
});
// create reporter plugins
b.finish().then(b.logger());