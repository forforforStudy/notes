1. 如何判断一个变量是否为数组
2. 数组的原生方法有哪些？
3. 如何将一个类数组变量转化为数组？
4. 说一说ES6中对于数组有哪些扩展
5. 数组去重，你能说出多少种方法？
6. 你知道Array.prototype的类型是什么吗？
7. 如何“打平”一个嵌套数组，如[1,[2,[3]],4,[5]] => [1,2,3,4,5]?你能说出多少种方法？
8. 如何克隆一个数组？你能说出多少种？
9. 说一说Array.prototype.sort()方法的原理？（追问：不传递参数会如何？）
10. 找出Array中的最大元素，你能说出几种方法？

作者：英俊潇洒你冲哥
链接：https://zhuanlan.zhihu.com/p/29514159
来源：知乎
著作权归作者所有，转载请联系作者获得授权。

对应
1. `Object.prototype.toString.call([]) === '[object Array]'` 或者 `Array.isArray`

2. 查 MDN, 一般没有返回值的都会改变自身

3. 使用 `Array.prototype.slice` 处理或者直接使用 `for` 循环生成一个新的数组. 漏了: **es6 的 Array.from 方法**

4. 数组解构赋值; `Array.from`; `Array.of`: 将传入的参数转换成对应的数组; 增加一些方法: `entries`, `copyWithin`, `values`(返回 `Array Iterator`) 等

5. `_.unique`; es6 的 `Set` 对象; 空的 `Object` 对象存放是否有重复; 也可以反复遍历 `indexOf` 查找等, 当然这种比较低效

6. **居然是个数组**

7. `_.compact`; 递归存放到一个新的数组; 

8. 递归复制; `_.cloneDeep`; 浅拷贝还有 : `Array.prototype.concat` 或者 `Array.prototype.slice`

9. 参数为比较函数; 内部应该是快排;

10. 简单遍历; `sort` 后取第最大的一个; **Math.max.apply(null, [1, 2, 3, 5, 7])**