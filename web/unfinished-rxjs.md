> [https://github.com/xufei/blog/issues/38](https://github.com/xufei/blog/issues/38)

> [http://www.jianshu.com/p/43cbb90ae3cf](http://www.jianshu.com/p/43cbb90ae3cf)


一个精髓的代码: 

```js
const A = new Rx.Subject()
const B = new Rx.Subject()
const C = new Rx.Subject()

const D = Rx.Observable
  .combineLatest(A, B, C)
  .map(data => {
    let [a, b, c] = data
    return (a + b) * c
  })

D.subscribe(result => console.log(result))

setTimeout(() => A.next(2), 3000)
setTimeout(() => B.next(3), 5000)
setTimeout(() => C.next(5), 2000)

setTimeout(() => C.next(11), 10000)
```
