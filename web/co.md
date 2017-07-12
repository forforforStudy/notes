> [http://www.ruanyifeng.com/blog/2015/05/co.html](http://www.ruanyifeng.com/blog/2015/05/co.html)

# Co 自动执行库

## es6 Generator函数

将 Generator当做一个异步操作的容器, 自动执行需要一种机制: **当异步操作有了结果, 能够自动交回执行权**.

## co 库

co库将两种自动执行的方式包装成一个库, 执行权的交回有两种方法:

1. 异步操作包装成的 **[Thunk](./co.md)** 函数

2. Promise 对象

## co 源码

> [https://github.com/tj/co/blob/master/index.js](https://github.com/tj/co/blob/master/index.js)

### 核心函数 co

```js
function co(gen) {
  // 保存上下文
  var ctx = this;
  // 记录传入的参数
  var args = slice.call(arguments, 1);

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  // 这里原v4版本存在个问题, 垃圾回收没有效果.
  return new Promise(function(resolve, reject) {
    // 生成一个generator函数内部 遍历器 gen
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    // 初次执行
    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res) {
      var ret;
      try {
        // 执行 generator 的下个方法
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      // 将返回的ret提交下一个执行
      next(ret);
      return null;
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      // toPromise 方法将所有的结果转换成promise 对象
      var value = toPromise.call(ctx, ret.value);
      // 确认为 promise后, 执行下一项任务
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}
```

`toPromise` 方法如下:

```js
function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}
```

- 如果返回结果obj为 generator, 则再调用co方法自动执行该生成器方法

- thunkToPromise源码如下:

```js
function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    // thunk函数为只接收回调函数的方法, 所以直接如下, 传入回调函数, 在回调函数中 resolve/reject.
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}
```

- arrayToPromise 源码如下

```js
function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}
```

- objectToPromise 源码如下

```js
function objectToPromise(obj){
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    // 将每个对象转换成 promise 先
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  // 将最后所有的生成结果作为results对象返回, 其中results的设置是在 `defer` 方法中
  return Promise.all(promises).then(function () {
    return results;
  });

  // defer 方法将转换后的promise对象加入一个新的回调用于设置promise后的结果值
  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}
```
