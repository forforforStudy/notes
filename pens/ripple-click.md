> Ripple-click 样例如: [https://codepen.io/she_codes/pen/jEQmpO](https://codepen.io/she_codes/pen/jEQmpO)

Ripple-click 可以分两种实现情况

1. 点击波纹散开的地方是鼠标为中心

实现思路:

- 将父级node设定成非文档流

- 鼠标点击时, 获取点击的定位.

    1. 点击事件带入的 `event.pageX` 和 `event.pageY` 对应鼠标点击处相对于整个`document`文档的定位.

    2. 算出当前node最近的定位父节点(offsetParent, 因为已经将父级节点设定成非文档流, 所以这里就是父级node)相对于整个文档的偏移, `jQuery.fn.offset()` 方法或者递归使用 `offsetTop`/`offsetLeft`

至此可以算出鼠标点击时对于点击元素内的偏移量

```js
x = e.pageX - parent.offset().left;
y = e.pageY - parent.offset().top;
```

- 创建一个空元素 `ink`, 插入到点击元素的父级下, 也就是作为点击元素的兄弟元素.

设定空元素的初始CSS属性, 如下:

```CSS
.ink {
	display: block;
    position: absolute;
	background: hsl(180, 40%, 80%);
    /* 让整个元素呈现圆形 */
	border-radius: 50%;
	transform: scale(0);
}
```

- 设置空元素 `ink` 的几何属性. 将其长宽设置成父元素取长宽叫大的值, 如下:

```js
d = Math.max(parent.outerWidth(), parent.outerHeight());
ink.css({
    height: d,
    width: d
});
```

- 设置空元素 `ink` 的top和left. 取鼠标点击相对偏移的值减去一半, 如下:

```js
top: y - ink.height() / 2;
left: x - ink.width() / 2;
```

- 定义动画

    - 定义动画结束帧状态:

    ```css
    @@keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
    ```

    - 添加动画属性

    ```css
    .animate {
        animation: ripple 0.65 linear;
    }
    ```

- `$(ink).toggleClass('animate')` 实现每次点击的动画效果

2. 总是以组件中心作为散开的起点, 这种方式多数可以单纯使用CSS3来实现, 而无需使用JS
