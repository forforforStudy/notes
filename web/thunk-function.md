> [http://www.ruanyifeng.com/blog/2015/05/thunk.html](http://www.ruanyifeng.com/blog/2015/05/thunk.html)

# Thunk 函数

编译器传名调用, 将参数放到临时函数中, 将临时函数传入函数体. 这个临时函数就叫做thunk函数

例如有函数:

```js
function f(m) {
    return m * 2;
}
// 调用
f(x + 5)
```

传名调用就是将 `x + 5` 这个求值在实际函数执行中再去求值. 用thunk函数作为临时函数实现这个求值操作传入到函数中去作为一个表达式的替换, 如下:

```js
var thunk = function () {
    return x + 5;
};

function f(thunk) {
    return thunk() * 2;
}
```

## js中的 thunk 函数

js 中 thunk 的函数将多参函数转换成单参版本, 并且这个单参版本的函数只接收回调函数作为参数.

简易 thunk 函数如下:

```js
var Thunk = function(fn){
  return function (){
    var args = Array.prototype.slice.call(arguments);
    return function (callback){
      args.push(callback);
      return fn.apply(this, args);
    }
  };
};
```

## 在 generator 函数中的应用

如下情景:

```js
var fs = require('fs');
var thunkify = require('thunkify');
var readFile = thunkify(fs.readFile);

var gen = function* (){
  var r1 = yield readFile('/etc/fstab');
  console.log(r1.toString());
  var r2 = yield readFile('/etc/shells');
  console.log(r2.toString());
};
```

手动执行上部分代码如下:

```js
let g = get(),
    r1 = g.next()

r1.value(function (err, data) {
    if (err) {
        throw err
    }

    let r2 = g.next(data)

    r2.value(function (err, data) {
        if(err) {
            throw err
        }

        g.next(data)
    })
})
```

从上面代码可以看出, 这里是可以用一个递归来做这种重复性的工作的, 一个给予 thunk函数的 generator 自动执行器如下:

```js
function run(fn) {
    let gen = fn();

    function next(err, data) {
        let result = gen.next(data)
        if (result.done) {
            return
        }

        result.value(next)
    }

    next()
}

run(gen)
```
