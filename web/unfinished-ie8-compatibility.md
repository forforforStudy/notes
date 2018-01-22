> [http://reference.sdp.nd/fed/blog/2017/11/27/ie8-compatibility/](http://reference.sdp.nd/fed/blog/2017/11/27/ie8-compatibility/ )

# IE8 踩坑总结

## 跨域

### CORS

一般的跨域技术, 比较好的是使用 `CORS`, `CORS` 包括一些请求头部. 按请求头部和请求方法分成简单请求和非简单请求

**简单请求**满足以下要求:

1. 请求方法是以下三种方法之一：
    HEAD
    GET
    POST
        
2. HTTP的头信息不超出以下几种字段：
    Accept
    Accept-Language
    Content-Language
    Last-Event-ID
    Content-Type：只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain

#### 简单请求

直接发送, 并在头部附上 `Origin` 标明请求源. **服务端接收到`Origin`源后会按需进行处理, 返回 `Access-Control-Allow-Origin` 字段, 浏览器查看这个字段如果发现请求的源不在这个字段许可的范围内, 那么AJAX 就会抛出一个错误**

如果`Access-Control-Allow-Origin` 是允许的, 则会带上其它的头部

1. Access-Control-Allow-Origin 标明是否允许跨域的请求

    如果要发送Cookie，Access-Control-Allow-Origin就不能设为星号，必须指定明确的、与请求网页一致的域名

    Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传，且（跨源）原网页代码中的`document.cookie`也无法读取服务器域名下的Cookie

2. Access-Control-Allow-Credentials 布尔值, 表示是否允许带上 Cookie

    同时, `XMLHttpRequest.withCredentials = true` 设置AJAX请求的时候才会带上 `cookie`, 否则即使服务端统一, AJAX 也不会在请求时带上 `cookied`

3. Access-Control-Expose-Headers, 表示 ajax 中能够获取到的header字段

#### 非简单请求

先发送预检请求, **`OPTIONS`** 方法, 除简单请求的头部外, 还有两个特殊字段

- Access-Control-Request-Method

    必须的, 用来列出浏览器的 CORS 请求会用到的HTTP方法

- Access-Control-Request-Headers

    指定浏览器CORS请求会额外发送的请求头部

当预检被否定后, 会返回一个正常的HTTP回应, 但没有任何CORS相关的头信息字段. 浏览器就会认定预检请求没有通过, 会在`XMLHttpRequest` 抛出 `onerror` 事件

一般返回

- Access-Control-Allow-Methods

    允许的方法

- Access-Control-Allow-Headers

    允许的请求头

- Access-Control-Allow-Credentials

    与请求含义相同

- Access-Control-Max-Age

    指定本次的预检的有效期, 单位为秒

如果通过, 就会继续发送真正需要发送的请求.

### 服务端代理请求

加入 `Dispatcher` 请求头放入目标信息

门户这边是 `X-Domain-Proxy` 头部标明代理, 这个没有太多要说. 按一定规范传递给当前域的服务端, 服务端解析成对应的请求传递给目标服务地址.

主要还是浏览器这边的限制

## es3 保留字

IE8, IE9 下面都有这个问题, 对于比如字面量的键为 `default` 或者 `class` 等保留字, IE8, 9 的 js 引擎会解析出错, 报: "缺少标识符"

通用的办法是石龙 `es3ify-loader` 处理, 将字面量的保留字例如: `a.default` 转换成 `a['default']`

配置也给出: 

```js
postLoaders: [{
    test: /\.js$/,
    loaders: ['es3ify-loader']
}]
```

`es3ify-loader`相当于 `babelrc` 里面的两个插件
- `transform-es3-property-literals`
- `transform-es3-member-expression-literal`

webpack里面要是有用es3ify-loader,在.babelrc里面就不用配置这两个插件了
反之亦然

### `webpack.optimize.UglifyJsPlugin` 插件报错

[https://github.com/SamHwang1990/blog/issues/6](https://github.com/SamHwang1990/blog/issues/6)

此文章中的意思是这个问题跟 IE8 下带名字的函数表达式有[bug](http://kangax.github.io/nfe/#jscript-bugs), 如果生命一个非匿名函数给一个变量赋值,
在IE8下这个非匿名函数的名称也会在作用域中声明出一个变量出来, 而这个在其它现代浏览器中是没有的.

按如下配置: 

```js
new webpack.optimize.UglifyJsPlugin({
    compress: {
        properties: false,
        warnings: false,
        screw_ie8: false
    },
    output: {
        beautify: true,
        comments: false,
        quote_keys: true,
        screw_ie8: false
    },
    mangle: {
        screw_ie8: false
    }
})
```

## webpack 版本到 1.13.2

## `babel-polyfill`

`babel-polyfill` 本来为了解决 `es6` api 运行时兼容 `es5` 使用的, 因为在 IE8 下报错了, 这里给的方案是分别引入 `babel-polyfill` 中原先包含的两个库.

- `core-js`

- `regenerator-runtime/runtime`

其中主要调整 `core-js` 报错了, 引入一个 `core-js-ie8` 这个库. 但是 `core-js-ie8` 的 `Object.assign` 的实现也有问题, 所以文章作者自己发 npm 包修复兼容
[`core-js-for-ie8`](https://www.npmjs.com/package/core-js-for-ie8)

```js
import 'core-js-for-ie8'
import 'regenerator-runtime/runtime'
```

## `<input type="text">` => `<input type="password">`

ie8 下对于已经渲染完成的 `input` 标签是不允许修改 `type` 类型的. 但是对于 `react` 来说, diff 操作后只发现 `type` 变了, 所以只会修改 `type` 字段的值

这里文章作者通过给组件附上 `key` 值, 该元素就会进行重新渲染, 如下:

```jsx
{ isShowPassword ? <input type="text" key="text" /> : <input type="password" key="password" />
```

## 某些事件失效

`input` 元素下, 只有 `onClick` 事件会生效, 其它例如: `onChange` 和 `onInput` `onPropertyChange` 都是不生效的

这里通过引入第三方 polyfill 脚本

```html
<!--[if IE 8]><script src="//cdnjs.cloudflare.com/ajax/libs/ie8/0.3.2/ie8.js"></script><![endif]-->
```

上诉的这个文件时用来修复各种 IE8 神一般的错误的

[https://cdnjs.com/libraries/ie8](https://cdnjs.com/libraries/ie8)
[https://github.com/WebReflection/ie8](https://github.com/WebReflection/ie8)


添加后, 只需要保留 `onInput` 事件即可做出响应

## 使用 `rx-lite-compat` 替换 `rx-lite` 兼容 IE8 的 Observable 库

## 不支持 `transform:translate(-50%)`

## IE8 下的透明度

采用源生滤镜: `document.getElementById('shadow').style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity = 80)'`

## 引入 `es6-promise` 库支持 IE8

```js
require('es6-promise`).polyfill()
```

## 使用 `universal-fetch` 替换 `isomorphic-fetch` 库支持 IE8

## 引入 `console-polyfill`

## 使用 lodash 3.x 的版本兼容 IE8, 需要手动构建

文档地址: [https://lodash.com/docs/3.10.1#template](https://lodash.com/docs/3.10.1#template) 安装

`npm i -g lodash-cli@3.10.1`

安装完成后执行

`lodash compat`

会输出兼容IE6~IE8的版本lodash.custom.js及lodash.custom.min.js

## 停止使用 `get` 和 `set` 访问器属性

## 使用 **0.14版本的 react**