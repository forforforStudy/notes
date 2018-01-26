> [https://github.com/YuzuJS/setImmediate/blob/master/setImmediate.js](https://github.com/YuzuJS/setImmediate/blob/master/setImmediate.js)

# 从源码来看跨浏览器的异步实现方案

有优先采用的策略顺序: 

## `process.nextTick`

```js
function installNextTickImplementation() {
    registerImmediate = function(handle) {
        process.nextTick(function () { runIfPresent(handle); });
    };
}
```

主要出现在 nodejs 环境中

## 采用 `message` 事件机制

```js
function installPostMessageImplementation() {
    // Installs an event handler on `global` for the `message` event: see
    // * https://developer.mozilla.org/en/DOM/window.postMessage
    // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
    var messagePrefix = "setImmediate$" + Math.random() + "$";
    var onGlobalMessage = function(event) {
        if (event.source === global &&
            typeof event.data === "string" &&
            event.data.indexOf(messagePrefix) === 0) {
            runIfPresent(+event.data.slice(messagePrefix.length));
        }
    };

    if (global.addEventListener) {
        global.addEventListener("message", onGlobalMessage, false);
    } else {
        global.attachEvent("onmessage", onGlobalMessage);
    }

    registerImmediate = function(handle) {
        global.postMessage(messagePrefix + handle, "*");
    };
}
```

如上, 原理应该就是这个`message`事件的触发接收是一个异步过程调用. 朝自己发送一个 `message` 事件.

## `MessageChannel`

```js
function installMessageChannelImplementation() {
    var channel = new MessageChannel();
    channel.port1.onmessage = function(event) {
        var handle = event.data;
        runIfPresent(handle);
    };

    registerImmediate = function(handle) {
        channel.port2.postMessage(handle);
    };
}
```

如上, [`MessageChannel`](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel) 用于 `Web Worker` 技术提供通信信道.

操作类似 `postMessage` 发送事件的方式与属于一个异步调用