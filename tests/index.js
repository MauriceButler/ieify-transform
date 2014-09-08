var test = require('grape'),
    mockery = require('mockery'),
    pathToObjectUnderTest = '../';

mockery.registerAllowables([pathToObjectUnderTest]);

function resetMocks(){
    mockery.registerMock('through', function(chunk){
        return !!chunk;
    });
    mockery.registerMock('ieify', function(){});
}

function getCleanTestObject(){
    delete require.cache[require.resolve(pathToObjectUnderTest)];
    mockery.enable({ useCleanCache: true, warnOnReplace: false });
    var objectUnderTest = require(pathToObjectUnderTest);
    mockery.disable();
    resetMocks();
    return objectUnderTest;
}

resetMocks();

test('ieifyTransform Exists', function (t) {
    t.plan(2);
    var ieifyTransform = getCleanTestObject();
    t.ok(ieifyTransform, 'ieifyTransform Exists');
    t.equal(typeof ieifyTransform, 'function');
});

test('ieifyTransform rejects non .js files', function (t) {
    t.plan(2);

    var ieifyTransform = getCleanTestObject();

    t.equal(ieifyTransform('foo.txt'), false, 'ieifyTransform rejects .txt');
    t.equal(ieifyTransform('foo.js.txt'), false, 'ieifyTransform rejects .js.txt');
});

test('ieifyTransform accepts .js files', function (t) {
    t.plan(2);

    var ieifyTransform = getCleanTestObject();

    t.equal(ieifyTransform('foo.js'), true, 'ieifyTransform accepts .js');
    t.equal(ieifyTransform('foo.JS'), true, 'ieifyTransform accepts .JS');
});

test('ieifyTransform chunks and passes result to ieify', function (t) {
    t.plan(3);

    var expectedStreamData = '123456789';

    mockery.registerMock('ieify', function(data){
        t.equal(data, expectedStreamData, 'got correct data to ieify');
        return data;
    });

    mockery.registerMock('through', function(chunk, complete){
        var throughStream = {
            queue: function(data){
                t.equal(data, expectedStreamData, 'got correct data to stream');
                expectedStreamData = null;
            }
        };
        chunk(123);
        chunk(456);
        chunk(789);
        complete.call(throughStream);
    });

    var ieifyTransform = getCleanTestObject();

    ieifyTransform('foo.js');
});