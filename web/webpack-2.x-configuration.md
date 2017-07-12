> [https://webpack.js.org/configuration/](https://webpack.js.org/configuration/)

# Resolve

该参数配置模块是如何解析的.

## resolve `object`

配置模块如何被解析. 例如当,模块代码中出现了 `import 'lodash'`, `resolve` 配置项改
变webpack去何处寻找 `'lodash'`

## resolve.alias `object`

为`import` 或者 `require` 创建加载的别名, 例如:

```js
alias: {
  Utilities: path.resolve(__dirname, 'src/utilities/'),
  Templates: path.resolve(__dirname, 'src/templates/')
}
```

配置如上别名后, 在使用`import`或者`require`时就能简化写法从:

```js
import Utility from '../../utilities/utility';
```

变为:

```js
import Utility from 'Utility/utility'
```


### `$` 符号

在alias末尾添加`$`符号可以指明一个准确的文件匹配例如:

```js
alias: {
  xyz$: path.resolve(__dirname, 'path/to/file.js')
}
```

如上配置后, 加载时就可以直接使用了

```js
import Test1 from 'xyz'; // Success, file.js is resolved and imported
import Test2 from 'xyz/file.js'; // Error, /path/to/file.js/file.js is invalid
```

 alias | import 'xyz' | import 'xyz/file.js'
--|---|--
 {} | /abc/node_modules/xyz/index.js | /abc/node_modules/xyz/file.js
 { xyz: '/abc/path/to/file.js' } | /abs/path/to/file.js | error
 { xyz$: '/abs/path/to/file.js' } | /abs/path/to/file.js | /abc/node_modules/xyz/file.js
 { xyz: './dir/file.js' } | /abc/dir/file.js | error
 { xyz$: './dir/file.js'} | /abc/dir/file.js | /abc/node_modules/xyz/file.js
 {xyz: '/some/dir'} | /some/dir/index.js | /some/dir/file.js
 {xyz$: '/some/dir'} | /some/dir/index.js | /abc/node_modules/xyz/file.js
 {xyz: './dir'} | /abc/dir/index.js | /abc/dir/file.js
 {xyz: 'modu'} | /abc/node_modules/modu/index.js | /abc/node_modules/modu/file.js
 {xyz$: 'modu'} | /abc/node_modules/modu/index.js | /abc/node_modules/xyz/file.js
 {xyz: 'modu/some/file.js'} | /abc/node_modules/modu/some/file.js | error
 {xyz: 'modu/dir'} | /abc/node_modules/modu/dir/index.js | /abc/node_modules/dir/file.js
 {xyz: 'xyz/dir'} | /abc/node_modules/xyz/dir/index.js | /abc/node_modules/xyz/dir/file.js
 {xyz$: 'xyz/dir'} | /abc/node_modules/xyz/dir/index.js | /abc/node_modules/xyz/file.js

**TODO: <span style="color: red;">{xyz: 'modu/dir'} 在 `import 'xyz/file.js` 下的解析存在疑惑</span>**

## `resolve.aliasFields` `[string]`

默认为 `['browser']` 根据 [默认规范](https://github.com/defunctzombie/package-browser-field-spec) 进行解析

### 关于该属性的一些想法

联系`resolve.mainFields` 和 `package.json`, 因为 `package.json` 文件中通常配置 `main` 字段标明当被引用(例如: `require('foo')` 或者 `import from 'foo'`)时, 默认加载的文件路径.

上部分`browser`的默认规范中指出, 通过 `browser` 字段可以当模块用于 **client side use** 被第三发引用时作为一种信息提供给打包程序或者组件工具. 并且当配置了 `browser` 后, `main` 字段所指定的实体入口就会被替换掉.

### 推测

以下是 webpack 2.0 发布更新的说明:

> ```js
> aliasFields: ["browser"],
// These fields in the description files offer aliasing in this package
// The content of these field is an object where requests to a key are mapped to the corresponding value
> ```

因此该属性的配置, 可能是将描述文件 `package.json` 中的字段的值映射成别名, 典型的比如 `'browser'` 那个字段的值映射成一个别名 alias

## `resolve.descriptionFiles` `array`

用语描述的JSON文件, 默认为: `['package.json']`

## `resolve.enforceExtension` `boolean`

是否允许无扩展名文件, 例如默认情况下 `import a from './a/file'`是允许自动隐藏`.js`的文件扩展名的, 默认为 `false`.

## `resolve.enforceModuleExtension` `boolean`

是否允许使用模块扩展 (例如: loaders), 默认为 `false`

## `resolve.extensions` `array`

自动解析扩展, 默认为 `extensions: ['.js', '.json']`,  因此在使用时就可以不需要带上指定的文件扩展名:

```js
import File from '../path/to/file'
```

## `resolve.mainFields` `array`

该属性指定当从npm包中导入模块时, 此选项将决定在 `package.json` 中使用哪个字段导入模块. 根据`mainFields`的值, 按数组索引尝试加载.

当`target` 属性为 `webworker` 或者没有绑定时, 默认值为:

```js
mainFields: ['browser', 'module', 'main']
```

其它任意target 则为:

```js
mainFields: ['module', 'main'];
```

## `resolve.mainFiles` `array`

解析目录时默认的文件名称, 默认为 `mainFiles: ['index']`

## `resolve.modules` `array`

配置webpack解析模块时需要搜索的目录. 默认为 `modules: ['node_modules']`.

当需要添加一个目录到模块搜索目录, 按如下方式, 那么新的搜索模块会优先于`node_modules`进行搜索

```js
modules: [path.resolve(__dirname, 'src'), 'node_modules']
```

## `resolve.unsafeCache` `regext|array|boolean`

默认为 `true`, 用以主动缓存模块, 但并 **不安全**.

正则表达式或者数组用以匹配文件路径或之缓存某些匹配的模块.

## `resolveLoader` `object`

此处的配置专门用以解析webpack的loader包, 默认如下

```js
{
    modules: ["web_loaders", "web_modules", "node_loaders", "node_modules"],
    extensions: [".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
    packageMains: ["webpackLoader", "webLoader", "loader", "main"]
}
```

## `resolveLoader.moduleExtensions` `array`

该属性在解析模块时尝试使用的扩展. 在 webpack 1.x 时loader是不需要加上`'-loader'`后缀, webpack会自动加上`'loader'`.

webpack 2.x 后该功能可以再此处配置如下:

```js
moduleExtensions: ['-loader']
```

## `resolve.plugin`

用语在解析阶段所使用的插件列表, 官网给的例子是使用 `DirectoryNamedWebpackPlugin`

## `resolve.symlinks` `boolean`

是否将符号链接(symlink)解析到它们的符号链接位置(symlink location).

## `resolve.cachePredicate` `function`

一个决定是否将请求进行缓存的方法. 接收两个参数: `path` 和 `request`

# Output

配置webpack如何以及在哪输出打包的程序, 资源以及其他任何形式包.

## `output.chunkFilename` `string`

该配置决定按需加载(非入口)的chunks文件的名称, 路径相对于 `output.path` 目录. 具体的占位符可以参考 `output.filename`, 简单如下:

- [id] 被chunk的id替换
- [name] 被chunk的name替换, 如果chunk没有name时, 则会被 id 替换
- [hash] 被compilation生命周期的 hash 替换
- [chunkhash] 被 chunk 的hash替换

默认为 `'[id].js'`或者从`output.filename`推断出值.![plato构建后的文件对照](assets/e5074a598c349b588af2.png)

`chunkFilename`的使用场景: 一般情况下, 在使用诸如 `require.ensure()` 或者在 webpack v2.1.0-beta 后使用`import()`, 异步加载的文件是不会打包到最后的文件中去, 所以webpack会将这些文件生成成若干chunk文件, 用以实时动态的加载.

## `output.crossOriginLoading` `boolean|string`

当 `target` 为 `web` 时生效, 使用`<script>`JSONP跨域按需加载 chunks

当启用 [cross-origin属性](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) 时加载chunk可以接收以下的值:

- `false` 禁用跨域加载(默认)
- `'anonymous'` 不带凭据(credential)启用跨域加载
- `'use-credentials'` 带凭据(credential)的跨域加载
