> [https://webpack.js.org/concepts/hot-module-replacement/](https://webpack.js.org/concepts/hot-module-replacement/)

# Webpack 热替换

## 三个视角来看

### 从程序视角

1. 程序代码会询问HMR是否需要更新

2. HMR会异步下载更新的部分, 然后告诉程序由更新可用

3. 程序之后会向HMR发起请求, 应用更新的内容

4. HMR 同步执行应用更新内容


### 从webpack编译器本身来看

除开素材资源外, 编译器需要发出'update'使得上一个版本更新到新的版本. 'update'由两个部分组成:

1. 更新的清单mainfest(JSON 格式)

2. 一个或者多个 chunks(JavaScript)

其中, mainfest文件包括新编译的 hash 值以及 所有更新chunk的列表.

每个更新的chunk都包含相应chunk中所有更新模块的代码或者标明一个模块被移除掉.

编译器确保构期间, 这些模块id module id和chunk id一致. 编译器通常将这些id存储在内容中(例如 webpack-dev-server), 但也可以将他们存储在JSON文件中
