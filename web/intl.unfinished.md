# Intl 多语言标准

> [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

> 中文： [https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl)

## 国际化内容包括

### 日期格式

### 数字格式

### 金额显示

### 语言核对

## 语言区域识别和判定

## 常用参数

国际化相关的几个函数都是用**模式**用来识别语言区域和确定使用哪一种语言格式， 都接收 `locales` 和 `options` 参数

### `locales` 参数

必须是一个 [BCP 47 语言标记](https://tools.ietf.org/html/rfc5646) 规定的字符串或者是一个包括多个的语言标记数组

如果未提供或者 `undefined` 则会使用默认的 `locale`

#### BCP47 语言标记

按顺序包括： **语言代码 - 脚本代码 - 国家代码**， 这些代码可以再 [IANA语言子标记注册](http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry) 中查询到

所以，比较标准的中国使用的简体为 `zh-Hans-CN`

#### 使用

整个运行过程中，`locales` 参数会被拿来与可用的语言区域做对比然后选择出一个最合适的。又两种匹配算法

- 查找：查找 BCP47 语言标记

- 最佳命中：让运行时提供至少一个语言区域， 匹配的结果会比查找的算法更多

### `options` 参数

#### `localeMatcher` 属性

一般的构造函数和方法都支持， 值可以是 `lookup` 和 `best fit` 中的一种

## [`Intl.Collator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator)

用语敏感字符串的语言比较

核心方法 `compare`

用于比较两个字符长在指定的语言地区结果，规范要求结果返回 正值 (第一个值比第二个大) 、负值 (第一个值比第二个小) 或者0 (相等)

通过构造函数，传入上述的 `locales` 就可以指定特定的国家语言地区下比较了

## [`Intl.DateTimeFormat`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)

