## 高质量 React 组件

无需将精力放在对整体性能提高不大的代码优化，而应对关键影响的部分投入更多的精力。过早的优化可能会让代码复杂而难以维护， 但并不意味着我们要放弃让代码结构合理简单容易维护的优化

### `react-redux` 下的 `sholudComponentUpdate`

在 `react-redux` 的 `connect` 中其实有对 `sholudComponentUpdate`进行过优化处理的
`connect` 中的 `sholudComponentUpdate` 会将 `nextProps` 与上次的 `props` 进行浅层比较, 即 `===`

### 多组件性能优化

#### virtual dom diff (reconciliation)

react 的树对比的时间复杂度是 O(N), 它是性能和时间复杂度的最优折中

##### **reconciliation** 算法

1. 检查两个树形的根节点类型是否相同

    - 节点类型不同

        意味着整棵树改动, 所以直接宠幸构建新的 DOM 树.
        
        而原先的树形上的 React 组件会经历卸载的生命周期, 调用 `componetWillUnmount`, 而新的DOM节点就会经历 `componentWillMount`, `render`, `componentDidMount`

        所以从优化的角度来看, 随意变动节点类型是非常消耗性能的操作

    - 节点类型相同

        发现类型相同时, 也需要判断下节点的类型, 主要分为两类:

        1. DOM 元素类型, 即 HTML 的直接标签元素

            只需要对比下属性和内容, 只更新修改的部分

        2. React 组件类型

            根据新节点的 `props` 去更新原来的组件实例, 
            触发实例的更新过程: `componentWillReceviceProps` -> `shouldComponentUpdate` -> `componentWillUpdate` -> `render` -> `componentDidUpdate`

    - 

2. 

