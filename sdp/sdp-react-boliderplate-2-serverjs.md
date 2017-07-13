# 框架内容整理 (二)

> [http://git.sdp.nd/fed/react-boilerplate](http://git.sdp.nd/fed/react-boilerplate)

## server.js

查看 `package.json` 文件可以发现, `scripts` 下的命令特别是跟本地开发有关的脚本命令, 都是通过 node 执行 `server.js` 文件开始的

### 引入的主要核心模块

- express
- webpack

---

1. 首先, 传入加载的webpack配置文件生成一个编译后的 webpack 实例 compiler

```js
const webpack = require('webpack');
const config = require('./webpack.config');

const compiler = webpack(config);
```

2. 随后, 通过 express 创建一个web服务. express 可以看成nodejs下的类似tomcat的web应用服务框架.
创建完成web应用实例后, 调用 `app.use` 为其添加各种类型的中间件, 可以用来对各种请求的处理等.
框架中的中间件如下有:

    1. 托管静态文件
        ```js
        // 托管静态文件地址
        app.use(express.static(path.join(__dirname, '/')))
        ```

    2. webpack-dev-middleware

        该中间件也是 webpack-dev-server 使用到的核心中间件. 它将webpack打包好的静态文件放置在内存中, 并且允许在webpack打包文件发生变化时重新编译.

        网页对webpack打包的文件请求时, 会从内存中取出返回一个稳定的打包好后的包文件.

        ```js
        app.use(require('webpack-dev-middleware')(compiler, {
          noInfo: true,
          publicPath: config.output.publicPath
        }))
        ```

    3. webpack-hot-middleware

        结合`webpack-dev-middleware` 实现模块热重载, 即可以再不刷新页面的情况下实时替换.

        结合第一部分中在配置中 `entry` 配置了 `webpack-hot-middleware/client?reload=true` 入口.

        ```js
        app.use(require('webpack-hot-middleware')(compiler))
        ```

    4. json-server [https://github.com/typicode/json-server](https://github.com/typicode/json-server)

        Restful 风格的mock服务, 这里不展开
