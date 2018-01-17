# 渐进式Web应用程序

> [https://segmentfault.com/a/1190000012353473](https://segmentfault.com/a/1190000012353473)
> [https://github.com/SangKa/PWA-Book-CN](https://github.com/SangKa/PWA-Book-CN)

## `Service Worker`

简介: 时间驱动 `worker`, 生命周期与业务无关, 关联页面未关闭时, 它可以退出, 没有关联页面时也依然可以启动.

特性有: 

1. 丰富的离线体验

    解决页面白屏时间过长, 网络不稳定造成的加载中断导致页面不可用的情况.

2. 消息推送通知

3. 管理资源缓存

    `Service Worker Cache Api` 提供了更强大灵活的缓存控制.

4. 网络请求

    Chrome 浏览器提供了 `ServiceWorkerController` 可以拦截所有 `service worker` 的请求. 另外 js 也能监听 `fetch` 事件, 通过 `FetchEvent.respondWith` 返回符合期望的 `Response` 即页端拦截 `Response`

### 使用 

```js
navigator.serviceWorker.register('service-worker.js').then(function (registration) {
    // do something
})
```

通过 `register` 方法异步注册 `service worker` 执行脚本. 

### 生命周期

- `parsed` 注册完成, 解析完执行脚本, 但尚未安装
- `installing`: `service worker` 脚本 `install` 事件执行. 会等待事件中 `event.waitUntil()` 传入的 `Promise` 完成后执行
- `installed`: 此时页面被旧的 `service worker` 脚本控制, 所以当前的脚本尚未激活, 可以通过 `self.skipWaiting()` 激活新的 `service worker`
- `activating`: 对应 `server worker` 脚本 `activate` 事件执行
- `redundant`: 安装或者激活失败

### 常用方式

1. `install` 事件中, 抓取资源进行缓存
2. `activate` 事件中, 遍历缓存, 清除过期的资源
3. `fetch` 事件中, 拦截请求, 查询缓存或者网络, 返回请求的资源, 如下:

```js
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```