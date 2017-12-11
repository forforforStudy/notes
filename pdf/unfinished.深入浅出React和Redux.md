## 高质量 React 组件

无需将精力放在对整体性能提高不大的代码优化，而应对关键影响的部分投入更多的精力。过早的优化可能会让代码复杂而难以维护， 但并不意味着我们要放弃让代码结构合理简单容易维护的优化

### `react-redux` 下的 `sholudComponentUpdate`

在 `react-redux` 的 `connect` 中其实有对 `sholudComponentUpdate`进行过优化处理的
`connect` 中的 `sholudComponentUpdate` 会将 `nextProps` 与上次的 `props` 进行浅层比较, 即 `===`

### 多组件性能优化

#### virtual dom diff (reconciliation)

react 的树对比的时间复杂度是 O(N), 它是性能和时间复杂度的最优折中

##### **reconciliation** 算法

检查两个树形的根节点类型是否相同

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

        组件更新会在 `shouldComponentUpdate` 返回 `false` 时中止后续的调用

        如果是新的节点, 那么新组件会进行装载过程, 原来组件会进行更新过程

- `key` 通过给子组件 `key` 属性让 React 引擎识别出各个组件的身份调整识别策略提高渲染性能

    **书中并不推荐用数组的 `index` 作为key值? 给出的原因是下标不是唯一稳定不变的, 因为完全有可能一些操作会打乱数组的顺序**

    `key` 和 `props` 一样, 虽然给组件但是组件是不允许通过 `props` 访问到这两个属性的

#### reselect 优化 `mapStateToProps` 计算执行性能

原理在于: 如果相关状态没有改变, 那么完全可以直接使用上次 `mapStateToProps` 的值. 简单来说分为两个步骤:

1. 抽取第一层结果, 与之前抽取的第一层结果比较(我的理解就是输入数据), 进行简单的 `===` 对比

2. 根据第一层输入, 选择是否使用之前的缓存结果

感觉这里的思路和大部分缓存的思路是一样的, github 地址在下方

> [https://github.com/reactjs/reselect](https://github.com/reactjs/reselect)

## 高阶组件

实现高阶组件的方式有两种:

1. 代理方式
2. 继承方式

### 代理方式的高阶组件

其应用场景有如下几种:

- 操纵 `props`

    高阶组件可以增减删除修改传递给包裹组件的`props`列表, 书中给出了如下的例子用于显示

```js
const addNewProps = (WrappedComponent, newProps) => {
    return class WrappingComponent extends React.Component {
        render() {
            return <WrappingComponent {...this.props} {...newProps}>
        }
    }
}
```

- 访问 `ref`

- 抽取状态

`react-redux` 的 `connect` 代用后返回的就是一个高阶组件函数, 它的功能就是抽取状态

> 书中提到了一点, 通过调用 `this.setState({})` 可以去驱动组件执行一个更新过程

一个简易的 `connect` 函数调用返回的高阶组件可能是下面这样:

```js
render() {
    const store = this.context.store
    const newProps = {
        ...this.props,
        ...mapStateToProps(store.getState())
        ...maoDispatchToProp(store.dispatch)
    }

    return <WrappingComponent {...newProps} />
}
```

这里其实也算是在操纵 `props` 了.

- 包装组件

给组件包裹添加补充样式是这类方式的常用场景:

```js
const styleHOC = (WrappingComponent, style) => {
    return class HOCComponent extends React.Component {
        render() {
            return <div style={style}>
                <WrappingComponent {...this.props} />
            </div>
        }
    }
}
```

### 继承方式 (反向继承)

有个比较大的区别在于: **代理方式下产生的新组建和参数组件是两个不同的组件, 一次渲染两个组件都要经历各自的生命周期. 而在继承方式下只有一个生命周期**

也有集中应用场景:

1. 操作 `props`

书中给了如下例子:

```js
const modifyPropsHOC = WrappedComponent => {
    return class NewComponent extends WrappedComponent {
        render() {
            const elements = super.render()
            const newStyle = {
                color: (elements && elements.type === 'div') ? 'red' : 'green'
            }
            const newProps = { ...this.props, style: newStyle}

            return React.cloneElement(elements, newProps, elements.props.children)
        }
    }
}
```

一般不需要这么写, 应该直接用代理的方式操纵 `props` 即可

2. 操纵生命周期

这个是代理方式无法实现的功能: 操作组件的什么周期函数. 例如让一个组件只有在用户登录时才显示

#### 高阶组件名称

通过给高阶组件(返回的组件) 添加 `displayName` 字段属性用于在 `debug` 时能显示组件的名称

### 以函数为子组件

上述的高阶组件存在缺点: 对原组件的`props`有了固化的要求.

所以有另一种复用的方式: **以函数为子组件**.

此模式下, 要求组件必须有子组件存在, 而且这个子组件必须是一个函数,  在生命周期中, `this.props.children` 引用的就是子组件, `render` 函数会直接把 `this.props.children` 当做函数来调用,
得到的结果作为 `render` 函数的返回结果的一部分

这样就可以抛开具体的 `props` 名称的限制进行复用, 书上给的例子如下:

```js
import loggedinUser = 'mock user'
// 复用组件
class AddUserProp extends React.Component {
    render() {
        const user = loggedinUser
        return this.props.children(user)
    }
}
AddUserProp.propTypes = {
    children: React.PropTypes.func.isRequired
}

// 被增强的组件
<AddUserProp>
    {
        user => <Bar currentUser={user} />
    }
</AddUserProp>
```

--- PAGE 154