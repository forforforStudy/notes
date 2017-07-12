> [https://webpack.js.org/guides](https://webpack.js.org/guides)

# Code Splitting
## Dynamic import
### System.import

已经废弃, [废弃issue](https://github.com/webpack/webpack/issues/2163 "废弃issue").

所以在 v2.1.0-beta.28 版本中采用 `import()` 代替

- `require.ensure()` 可提供动态的模块加载能力
- 使用 import() 方法动态加载, 见 [import](#dynamic-import-import)

<h3 id="dynamic-import-import">import</h3>

```javascript
function route(path, query) {
  return import("./routes/" + path + "/route")
    .then(route => new route.Route(query));
}
```

# Dependency Management

## require with expression
### context module

当 webpack 分析如下加载:

```javascript
require("./template/" + name + ".ejs");
```

则, webpack所知的加载信息就会有

```javascript
Directory: ./template
Regular expression: /^.*\.ejs$/
```

模块上下文的生成后, 就包含了根据加载分析的条件, 取得模块目录下的所有匹配模块的集合.

并生成了模块名到模块id的一个映射, 如下

```javascript
{
    "./table.ejs": 42,
    "./table-row.ejs": 43,
    "./directory/folder.ejs": 44
}
```

因此正如官网所述

> This means dynamic requires are supported but will cause all possible modules to be included in the bundle.

## require.context

`require.context(directory, useSubdirectories = false, regExp = /^\.\//)`

方法允许通过传递一个目录进行搜索, 返回一个 [context module](#require-with-expression-context-api)

- `useSubdirectories` 参数声明是否遍历子目录的模块.

- `regExp` 参数作为一个匹配文件的正则表达式

<h2 id="require-with-expression-context-api">context module API</h2>

`require.context` 对象本身是返回的是一个方法, 接受一个参数 `request`

自身拥有三个属性:

- `resolve` function 类型, 返回解析后的请求模块id

- `keys` 方法, 返回一个数组, 包含了所有context-module能处理通过request解析后的模块

官网例子如下, 加载所有模块:

```javascript
var cache = {};
function importAll (r) {
  r.keys().forEach(key => cache[key] = r(key));
}
importAll(require.context('../components/', true, /\.js$/));
// At build-time cache will be populated with all required modules.
```

vue-scaffold 给的例子如下, 功能类似. 动态加载指定目录下的指定模块:

```javascript
const constantsContext = require.context('./constants/', false, /\.js$/)

export default constantsContext.keys().reduce((constants, key) => {
  return Object.assign(constants, constantsContext(key))
}, {})
```

- `id` context-module 本身的模块id
