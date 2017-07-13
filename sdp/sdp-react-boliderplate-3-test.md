# 框架内容整理 (三)

> [http://git.sdp.nd/fed/react-boilerplate](http://git.sdp.nd/fed/react-boilerplate)


整体框架中使用 **karma + mocha + chai** 的技术组合, 其中karma提供测试执行管理, mocha为测试框架, chai为测试断言库

## karma

[http://karma-runner.github.io/1.0/intro/installation.html](http://karma-runner.github.io/1.0/intro/installation.html)

脚手架中, karma 的配置文件为 `karma.config.js`
详细的配置介绍可以在
[配置文件](http://karma-runner.github.io/1.0/config/configuration-file.html)中了解.

文件中重要的点有:

1. browsers

    配置karma 能够捕获到的浏览器, 当karam启动时, 它会自动也启动该配置下的浏览器项并能捕获控制它们.
    karma目前支持大部分浏览器, 但是都要 **安装对应的浏览器npm插件包** 支持.

    在脚手架中使用的 `PhantomJS` 是一个基于 webkit内核的无界面的浏览器. 可以看成是一种浏览器只是没界面但依然提供了浏览器该有的标准接口.

2. webpack

    安装 `karma-webpack` 后在这里引入webpack的配置文件, 就可以在karam下对要测试的文件进行webpack的预处理操作.

    可以在另一处的配置 `preprocessors` 中看到

    ```js
    preprocessors: {
        'test/index.js': ['webpack', 'sourcemap']
    }
    ```

    这里就是在入口文件中进行预处理: webpack的打包以及生成 sourcemap 文件

2. coverageReporter

    测试覆盖率报告生成配置

### 入口文件 `test/index.js` 分析

```js
// 引入 babel 的 polyfill 脚本文件, 已兼容旧浏览器部分方法的缺失
require('babel-polyfill')
// 引入 Object.assign 方法
require('core-js/fn/object/assign')
// 引入多语言方案 intl
global.Intl = require('intl')
require('intl/locale-data/jsonp/zh')
require('intl/locale-data/jsonp/en')
```

其中`Intl` 是ES 标准多语言解决方案, 具体可以参考 [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl), 此处不展开

---

```js
// chai 断言库
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'

chai.use(chaiEnzyme())
```

enzyme ([http://airbnb.io/enzyme/](http://airbnb.io/enzyme/)) 是用于React测试的实用工具库, 包含很多测试React的工具方法等.

引入[`chaiEnzyme`](https://github.com/producthunt/chai-enzyme)后, `chai.use`给`chai`补充了`enzyme`断言方法.

---

```js
const testsContext = require.context('.', true, /(\.test\.js$)|(Helper\.js$)/)
testsContext.keys().forEach(testsContext)
```

这里使用了 webpack 内置的方法 [`require.context`](https://webpack.github.io/docs/context.html#require-context) 获取某个路径下的上下文对象`testsContext`.

`testsContext` 本身传入一个路径可以加载指定的模块, 因此这里通过 `testsContext.keys().forEach(testsContext)` 加载这个路径下的所有文件.

### `sinon` 辅助测试工具库

三个核心概念: **spy, stub, mock**, 这里简单过一下:

- [spy](http://sinonjs.org/releases/v2.3.7/spies/)

`sinon.spy` 用于包裹某个方法, 类似于加一层代理. 这层代理会记录调用的参数, 被调用次数, 返回值, 调用的异常等等

- [stub](http://sinonjs.org/releases/v2.3.7/stubs/)

`stub`桩业实现了`spy`的能力, 作为被测对象在测试过程中需要能感知到的一个功能或一段代码.

- [mock](http://sinonjs.org/releases/v2.3.7/mocks/)

`mock` 作为一个虚假的功能代码, 能按照测试的意愿返回指定需要的信息.

## 单元测试

## e2e测试
