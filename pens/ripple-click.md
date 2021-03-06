# 水波纹点击实现

## 实现思路:

> 点击波纹散开的地方是鼠标为中心

1. 将父级node设定成非文档流

2. 鼠标点击时, 获取点击的定位.

    1. 点击事件带入的 `event.pageX` 和 `event.pageY` 对应鼠标点击处相对于整个`document`文档的定位.

    2. 算出当前node最近的定位父节点(offsetParent, 因为已经将父级节点设定成非文档流, 所以这里就是父级node)相对于整个文档的偏移, `jQuery.fn.offset()` 方法或者递归使用 `offsetTop`/`offsetLeft`

	至此可以算出鼠标点击时对于点击元素内的偏移量

	```js
	x = e.pageX - parent.offset().left;
	y = e.pageY - parent.offset().top;
	```

3. 创建一个空元素 `ink`, 插入到点击元素的父级下, 也就是作为点击元素的兄弟元素.

	设定空元素的初始CSS属性, 如下:

	```css
	.ink {
		display: block;
	    position: absolute;
		background: #aaa;
	    /* 让整个元素呈现圆形 */
		border-radius: 50%;
		transform: scale(0);
	}
	```

4. 设置空元素 `ink` 的几何属性. 将其长宽设置成父元素取长宽叫大的值, 如下:

	```js
	r = Math.max(parent.outerWidth(), parent.outerHeight());
	ink.css({
	    height: r,
	    width: r
	});
	```

5. 设置空元素 `ink` 的top和left. 取鼠标点击相对偏移的值减去一半, 如下:

	```js
	top: y - ink.height() / 2;
	left: x - ink.width() / 2;
	```

6. 定义动画

    - 定义动画结束帧状态:

    ```css
    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
    ```

    - 添加动画配值

    ```css
    .animate {
        animation: ripple 0.65s linear;
    }
    ```

7. toggle 动画类

    ```js
    $(ink).removeClass('animate')
    // do something ...
    $(ink).addClass('animate')
    ```

## 实际代码

<!-- more -->

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title></title>
        <link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
        <style media="screen">
            @-webkit-keyframes ripple {
                to {
                    opacity: 0;
                    transform: scale(2.5);
                }
            }
            @keyframes ripple {
                to {
                    opacity: 0;
                    transform: scale(2.5);
                }
            }

            .animate {
                -webkit-animation: ripple 0.65s linear;
                animation: ripple 0.65s linear;
            }

            .ink {
            	display: block;
                position: absolute;
            	background: #aaa;
            	border-radius: 50%;
            	transform: scale(0);
            }

            .list-group-item {
                overflow: hidden;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <section class="container-fluid">
            <article class="row">
                <ul class="ripple-container col-md-4 col-md-offset-4 col-xs-4 col-xs-offset-4 col-lg-2 col-lg-offset-5 list-group text-center">
                    <li class="list-group-item">Angular</li>
                    <li class="list-group-item">React</li>
                    <li class="list-group-item">Vue</li>
                    <li class="list-group-item">Emeber</li>
                    <li class="list-group-item">CycleJs</li>
                    <li class="list-group-item">RxJs</li>
                </ul>
            </article>
        </section>
        <script>
            (function($) {
                $('.ripple-container > li').click(function (event) {
                    var $this = $(this);
                    // 点击相对于整个文档的偏移
                    var pageX = event.pageX;
                    var pageY = event.pageY;

                    // 获取 ink 元素
                    var $ink = $this.find('.ink');
                    if ($ink.length === 0) {
                        $ink = $('<i class="ink"></i>').appendTo($this);
                    }

                    $ink.removeClass('animate');

                    // 定位父元素 $offsetParent 相对于整个文档的偏移 offset
                    var $offsetParent = $ink.offsetParent();
                    var $parent = $ink.parent();
                    var pOffset = $offsetParent.offset();
                    var pLeft = pOffset.left, pTop = pOffset.top;

                    // 计算出鼠标点击对于最近定位父元素内的偏移
                    var clickLeft = pageX - pLeft;
                    var clickTop = pageY - pTop;

                    // 取点击元素的父元素长宽中较大的值， 设定 ink 元素长宽
                    var r = Math.max($parent.outerWidth(), $parent.outerHeight());
                    $ink.css({
                        height: r,
                        width: r,
                        left: (clickLeft - r / 2) + 'px',
                        top: (clickTop - r / 2) + 'px'
                    });

                    $ink.addClass('animate');
                });
            })(window.jQuery);
        </script>
    </body>
</html>
```
