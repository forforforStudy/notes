# 框架内容整理

> [http://git.sdp.nd/fed/react-boilerplate](http://git.sdp.nd/fed/react-boilerplate)

## 从 webpack.config.js 说起

### 多环境打包

#### process.args

##### minimist

命令行解析库, 在脚手架中通过`minimist` 库, 将例如 `node server.js --env=dev` 中的 `env` 作为命令行参数解析出来.

所以在 `webpack.config.js` 中看到如下代码:

```js
const args = require('minimist')(process.argv.slice(2));

if (args._.length > 0 && args._.indexOf('start') !== -1) {
  env = 'test';
} else if (args.env) {
  env = args.env;
} else {
  env = 'dev';
}
```

主要如代码所见是为了解析出 `env` 参数, 提供打包时的环境上下文参数. 依据 `env` 的不同环境去取`cfg`目录下不同环境的配置文件

#### cfg/defaults.js

##### getDefaultModules

用以生成 `module` 配置参数, 返回如下三个字段

- preLoaders

    在执行 `loader` 前调用的 `loader`, 常用场景是使用 `eslint-loader` 做代码校验.

- loaders

    `webpack` 核心之一, 用以各种资源类型的统一转换成标准输出.

    > 详见 `webpack 1.x` [https://webpack.github.io/docs/loaders.html](https://webpack.github.io/docs/loaders.html)

- postLoaders

    执行 `loader` 后调用, 在脚手架中使用 `es3ify-loader` 进行 `postLoaders`. `es3ify-loader` 用语将某些ie8有错误的语法转换成支持ie8的, 例如使用 `default` 等关键词作为属性的:

    ```js
    // es3ify-loader 转换前, 在ie8会报错
    return object.default
    // es3ify-loader 转换后
    return object['default']
    ```

##### getDefaultPostcss

用以生成 `postcss` 字段属性, `postcss` 是一个CSS处理器平台, 提供丰富插件处理`CSS`. [https://www.zhihu.com/question/46312839](https://www.zhihu.com/question/46312839)

不展开, 截至目前(2017-07-11) 使用的插件如下:

1. postcss-import

    用于将`CSS`中的 `@import` 的文件内联到当前样式文件中

2. postcss-assets

    > [https://github.com/borodean/postcss-assets](https://github.com/borodean/postcss-assets)

    主要用来处理图像文件, 通过 `loadPaths` 配置参数, 处理定义的三个方法

    - `resolve`

        解析出文件的完整路径替换成标准的 `url(xxxx)` 形式

    - `width/height/size`

        获取图像的宽度/高度/尺寸

    - `inline`

        将图片以BASE64编码的方式内联到样式中

3. postcss-cssnext

    > [https://github.com/MoOx/postcss-cssnext](https://github.com/MoOx/postcss-cssnext)

    使用[下一代](http://cssnext.io/features/)CSS语法, 这里语法不展开. 就像 `babel` 编译 `es6/jsx` 成 `es5` 的风格.

4. postcss-browser-reporter

    >[https://github.com/postcss/postcss-browser-reporter](https://github.com/postcss/postcss-browser-reporter)

    在该插件前的`postcss`插件有错误或者警告, 该插件会以`html:before`的形式显示在页面上

5. postcss-reporter

    >[https://github.com/postcss/postcss-reporter](https://github.com/postcss/postcss-reporter)

    在控制台中使用 `console.log` 打印出`postcss`中报告的信息.

##### srcPath

声明源代码的基本路径, 这里主要用于`base.js` 中声明`alias` 时的路径定位

##### publicPath

指定输出文件中的公共url地址前缀, 多用于 `href` 属性或者 css 中 `url()`.

`publicPath` 甚至可以是 **CDN** 地址

```js
publicPath: "http://cdn.example.com/assets/[hash]/"
```

> dev-server 也使用该参数决定文件的输出路径

##### port

此处的配置用于 `devServer` 的 `port`参数使用.

#### cfg/base.js

webpack 核心配置模块

##### alias

配置在alias上的对象字段, 在文件中可以按照引入 `node_modules` 模块的方式引入, 而无需写全路径

##### devtool

debugging 用工具, 共分为如下几种

- eval
- source-map
- hidden-source-map
- inlin-source-map
- eval-source-map
- cheap-source-map
- cheap-module-source-map

它影响整个打包后的文件代码组织形式. 加上前缀'#' 则会强制使用该模式.

##### devServer

> [https://github.com/webpack/webpack-dev-server](https://github.com/webpack/webpack-dev-server)

- `contentBase`

    声明以哪个目录作为web应用的根目录, 脚手架中服务的基础地址就是 `src` 目录

- `publicPath`

    在 **devServer** 中, `publicPath` 指明在server中webpack打包后的路径地址.

    在脚手架中, `publicPath` 的设置如下

    ```js
    publicPath: process.env.NODE_ENV === 'production' ? 'assets/' : '/assets/', // dist时使用相对路径
    ```

    因此, 在devServer运行时, webpack的打包目标地址都会加上 `publicPath` 作为前缀.

    来看叫脚手架, 在非生产的环境下, `publicPath` 为 `assets/`, 所以devServer 运行时打包生成的文件路径就会在 `http://localhost:8080/assets/`

#### `'dev', 'dev-ie8', 'dist', 'test'`

根据 `env` 的不同取4个不同的环境.

- dev

    entry 下有两个入口:

    1. `webpack-hot-middleware/client?reload=true`

        引入这个脚本旧可以让页面与服务建立自动热部署的链接, 当文件更新修改后该脚本就能嗅探到从而进行热部署或者自动刷新

    2. `./src/index`

配置中使用的 plguins 为官方要求的三个插件, 其中 `OccurenceOrderPlugin` 用于根据使用的次数自动分配id, 使用次数越多, 分配的id越小

```js
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
```

- dev-ie8

同 `dev` 配置文件, 唯一不同在于在 `entry` 中移除了 `webpack-hot-middleware/client?reload=true` 作为打包的入口

- dist

    插件列表

    1. `new webpack.optimize.DedupePlugin()`

    去除多余重复的交叉依赖树

    2. `new webpack.optimize.OccurenceOrderPlugin()`

    见 `dev` 配置下的说明

    3. `new webpack.DefinePlugin`

    传入到 `DefinePlugin` 中的参数会作为一个全局常量在编译时使用.

    典型的在脚手架中`dist`环境声明 `process.env.NODE_ENV` 为 `production`, 指明当前的环境为生产环境. 此时这个变量就会在 `cfg/defaults.js` 下面的代码中生效了

    ```js
    publicPath: process.env.NODE_ENV === 'production' ? 'assets/' : '/assets/'
    ```

    4. `new webpack.optimize.UglifyJsPlugin`

    压缩/混淆代码

    5. `new webpack.optimize.AggressiveMergingPlugin`

    合并chunk块, 直到块大小到达一定大小. 这样就避免了多个小的chunk块造成多http请求反而更慢.

    6. `webpack.NoErrorsPlugin`

    跳过编译时出错的代码并记录，使编译后运行时的包不会发生错误

- test

    1. `preLoaders` 下的 `isparta-instrumenter-loader` 用于统计测试覆盖率

    2. `externals`

    此处用语配置外部的依赖, 在这里配置的对象在通过`require`或者 `import` 引入使用的时候, 不会被webpack打包到最终文件中.

    典型的例如页面上已经引入了CDN 上的 `jQuery`, 使用一致模块导入 `jQuery` 而不会打包到最后的 bundle 文件中
