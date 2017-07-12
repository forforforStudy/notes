# html-webpack-plugin

用于自动生成html文件

## 基础使用

```javascript
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpackConfig = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [new HtmlWebpackPlugin()]
};
```

## 所有参数配置

1. title

    生成html文档的title标签内的值

2. filename

    生成的文件名, 默认为 `index.html`. 这里的filename是允许指定路径的, 例如 `assets/admin.html` 文件就会生成在指定的assets文件夹下的`admin.html`文件

3. template
4. inject

    `true` | `head` | `body` | `false`

    将所有的资源注入到指定的`template`或者`templateContent`.

    传递`true`或者`body`, 所有生成的js文件都会追加到`body`的元素的底部.

    传递`head`会将生成的脚本生成在`head`标签内

5. favicon

    网站图标文件, 通过路径引入

6. minify

    `{...}` | false

    `html-minifier` 参数对象, 具体地址: [https://github.com/kangax/html-minifier#options-quick-reference](https://github.com/kangax/html-minifier#options-quick-reference)

7. hash

    `true` | `false`

    设置为true时, 会为所有生成webpack模式下生成的js文件, css文件追加 hash code.

8. cache

    `true` | `false`

    默认为`true`

9. showErrors
10. chunks
11. chunksSortMode
12. excludeChunks
13. xhtml

    `true` | `false`

    默认为`false`, 用以标识是否用XHTML模式来渲染

14.
