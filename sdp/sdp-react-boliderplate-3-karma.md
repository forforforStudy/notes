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

    测试覆盖率报告生成方式

### 入口文件 `test/index.js` 分析



## mocha

## chai

## 单元测试

## e2e测试
