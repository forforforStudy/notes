> [http://cn.redux.js.org/docs/introduction/CoreConcepts.html](http://cn.redux.js.org/docs/introduction/CoreConcepts.html)

# 核心概念

首先, 用以对象来描述应用时, 我们称之为`state`, 这个对象不应该随意的修改它.

为了修改这个`state`的某些字段属性, 应该发起一个`action`. `Action` 只是一个普通的 JavaScript 对象, 用来描述发生了什么事情.

```js
{ type: 'ADD_TODO', text: 'Go to swimming pool' }
{ type: 'TOGGLE_TODO', index: 1 }
{ type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
```

> 这个可以联系 Vuex 里`mutation`.

使用`Action`来描述事件, 最重要的一点在于它能将应用的变化变成可跟踪的, 能知道应用发生了什么事情.

## reducer

将`action`和`state`建立关系的, 就是`reducer`.

`reducer`接收`state` 和 `action` 将其转换成新的`state`的一个函数

对于大的应用, 应该使用多个小函数来管理`state`的一部分, 如下官网的例子非常典型:

    1. 两个 `reducer`
    ```js
    function visibilityFilter(state = 'SHOW_ALL', action) {
      if (action.type === 'SET_VISIBILITY_FILTER') {
        return action.filter;
      } else {
        return state;
      }
    }

    function todos(state = [], action) {
      switch (action.type) {
      case 'ADD_TODO':
        return state.concat([{ text: action.text, completed: false }]);
      case 'TOGGLE_TODO':
        return state.map((todo, index) =>
          action.index === index ?
            { text: todo.text, completed: !todo.completed } :
            todo
       )
      default:
        return state;
      }
    }
    ```
    2. 合并两个`reducer`, 这样就能将的大应用分散复杂度, 分片管理
    ```js
    function todoApp(state = {}, action) {
      return {
        todos: todos(state.todos, action),
        visibilityFilter: visibilityFilter(state.visibilityFilter, action)
      };
    }
    ```

# 三大原则

## 单一数据源

整个应用的`state`存储在一个 object tree 中.

## State 是只读的

**唯一改变`state`的方法就是触发`action`, `action`来描述已发生事件的普通对象**

确保了视图和网络请求都不能直接修改`state`, 所有的修改都被集中化处理, 且依照严格的顺序执行, 不必担心`race condition`.

## 使用纯函数来执行修改

**为了描述`action`如何改变 `state` 对象, 需要编写 `reducers`**

随着应用的增大, 复杂度的增加, 应该将`reducer`拆分成多个`reducers`, 分别独立操作`state tree` 的不同部分.

保证`reducer`是纯函数, 可以控制它们被调用的顺序以及传入附加数据 + 可复用`reducer`处理通用任务.

# Action

`Action` 是把数据从应用传到`store`的有效载荷, 它是`store`的 **唯一数据来源**.

一般而言, 可以通过`store.dispathc()` 将`action`传到`store`

约定`action`必须使用一个字符串`type`字段来表示将要执行的动作.

减少`action`中传递的数据量是一个比较好的实践.

## Action 创建函数

**Action创建函数就是生成action的方法.**, 典型如下:

```js
function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  }
}
```

在`redux`中只要把`action`创建行数传递给`dispatch()`方法即可.

# Reducer

## 设计 `State` 结构

**开发前考虑如何以最简单的形式, 把应用的`state用对象进行描述`**

## 处理`Action`

永远不要在`reducer`中执行:

1. 修改传入参数

2. 执行有副作用的操作, 如API请求和路由跳转

3. 调用非纯行数, 入`Date.now()` 或 `Math.random()`

**没有特殊情况、没有副作用，没有 API 请求、没有变量修改，单纯执行计算**

还需要注意:

1. **不要修改state**, 新建一个副本

2. 遇到未知或者`action`时一定返回旧的`state`

## 拆分Reducer

```js
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          })
        }
        return todo
      })
    default:
      return state
  }
}

function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter
    default:
      return state
  }
}

function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```

拆分多个`reducer`.  **注意每个 reducer 只负责管理全局 state 中它负责的一部分。每个 reducer 的 state 参数都不同，分别对应它管理的那部分 state 数据**

`Redux`提供了 `combineReducers` 工具处理.

# Stroe

- 维持应用 state
- 提供`getState()` 方法
- `dispatch(action)` 方法更新state
- `subscribe(listener)` 注册监听器
- `unsubscribe(listener)` 取消注册监听器

```js
let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)
```

# 数据流

`Redux`应用中数据的生命周期遵循下面4个步骤

1. 调用 `store.dispatch(action)`

告诉`store`发生了一件`action`.

2. `store`调用传入的`reducer`函数.

`store`将当前的`state`和`action`传入到`reducer`中. `reducer`是可预测的, 多次传入相同的输入必定有相同的输出.

3. 根`reducer`把多个`reducer`输出合并成一个单一的`state`树

4. 新的树将应用新的`state`, 并调用所有订阅(`store.subscribe(listener)`)
