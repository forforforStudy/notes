const requestPromise = require('request-promise');
const co = require('co');

function loadCategory(code) {
    return requestPromise(`http://esp-lifecycle.beta.web.sdp.101.com/v0.6/categories/${code}/datas?words=&limit=(0,2)`).then(transformResp);
}

function *lcFetcher() {
    yield ['Start load subjects'];
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

co(lcFetcher);
