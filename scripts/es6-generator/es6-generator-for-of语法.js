function printValue(value) {
    console.log(value);
}

function *autoTalk() {
    yield 'Hi';
    yield 'Linnan';
    yield `It's times ${Date.now()}`;

    return 'Over';
}

for (let iterator of autoTalk()) {
    printValue(iterator);
}
