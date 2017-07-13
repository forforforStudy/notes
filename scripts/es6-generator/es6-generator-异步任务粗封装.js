const requestPromise = require('request-promise');

function printValue(value) {
    console.log(value);
}

function loadCategory(code) {
    return requestPromise(`http://esp-lifecycle.beta.web.sdp.101.com/v0.6/categories/${code}/datas?words=&limit=(0,2)`).then(transformResp);
}

function *lcFetcher() {
    yield 'Start load subjects';
    const subjectResults = yield loadCategory('$S');
    console.log('subjects value: ', subjectResults);

    const editionResults = yield loadCategory('$E');
    console.log('editions value', editionResults);
    return 'Done';
}

function transformResp(resp) {
    const { items } = JSON.parse(resp);
    return items.slice(0, 5).map(item => item.title);
}

const fetcher = lcFetcher();

var nexter = fetcher.next();
printValue(nexter);

nexter = fetcher.next();
nexter.value.then(function (resp) {
    nexter = fetcher.next(resp);
    return nexter.value;
}).then(function (resp) {
    nexter = fetcher.next(resp);
    return nexter.value;
}).then(function () {
    nexter = fetcher.next();
    console.log(nexter);
});
