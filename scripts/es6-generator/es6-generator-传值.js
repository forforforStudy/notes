function printValue({ value }) {
    console.log(value);
}

function *autoTalk() {
    const name = yield 'Hi';
    const time = yield name;
    yield `It's time ${time}`;

    return 'Over';
}

const talker = autoTalk();

printValue(talker.next());
printValue(talker.next('Linnan'));
printValue(talker.next(Date.now()));
printValue(talker.next());
