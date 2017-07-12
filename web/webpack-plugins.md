# webpack 相关插件

## ProvidePlugin

该插件可以提供一个全局的变量使用, 而不需要在每个文件中显示使用 `import` 或者 `require` 引入.

官网给出的例子非常典型了:

```js
new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery'
});
```

上面定义后, 直接在模块使用:

```js
// import $ from 'jquery' 不需要这里的引入了
$('#item');
jQuery('#item');
```
