function printValue({ value }) {
    console.log(value);
}

function *autoTalk() {
    yield 'Hi';
    yield 'Linnan';
    yield `It's time ${Date.now()}`;

    return 'Over';
}

const talker = autoTalk();

printValue(talker.next());
printValue(talker.next());
printValue(talker.next());
printValue(talker.next());
