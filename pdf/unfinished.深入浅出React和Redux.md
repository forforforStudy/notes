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

> 在 `react-motion` 中就大量用到了 **"以函数为子组件"** 的模式

#### 性能问题

函数为子组件的方式, 难以优化性能. 因为它的每次渲染都要调用函数而无法避免使用 `shouldComponentUpdate` 来避免渲染浪费

所以这边的策略是对外部的组件做性能优化, 控制其 `sholudComponentUpdate` 的执行结果, 例如上面例子中的 `AddUserProp` 组件

## Redux 和服务器通信

### redux-thunk

在一个 `action` 对象通过 `store.dispatch` 派发后, 在调用 `reducer` 函数之前会经过一个中间件的环节, 在这里可以产生一个异步操作的机会.

#### 异步 action 对象

当 `action` 对象是一个函数时, redux-thunk 会检查 `action` 是否是函数, 如不是函数就继续下发下一个中间件或者返回中间件的执行流程.
如果发现 `action` 是函数那就执行这个函数, 并把`store` 的 `dispatch` 方法和 `getState` 函数作为参数传递给这个函数, 处理过程中止, 不会继续派发到 `reducer` 函数中

#### 异步操作的模式

一个异步应该有三种状态:

1. 异步操作正在进行
2. 操作完成
3. 操作失败

所以, 为异步模式下我们需要定义三种 `action` 类型, 代表上诉的三种状态.

#### 中断异步请求

比如全局遮罩, 或者冻结操作变更可以便面异步数据前后到达不一致, 但体验存在问题.

书中给出的方案, 提供一个模块级别的序列号, 每次的异步请求自增+1, 在每次 `dispatch` 之前, 校验序列号是否匹配, 如果不匹配就不进行 `dispatch` 的转发.  

#### 其它异步方法

- redux-sage
- redux-effects
- redux-side-effects
- redux-look
- redux-observable

- redux-promise

`promise` 这是另一种异步方式, 将 `Promise` 作为特殊处理的异步`action`对象

## 单元测试

不同角度的测试, 可以分为多个类型

- 手工测试和自动化测试
- 白盒测试和黑盒测试
- 单元测试, 集成测试和端到端测试
- 功能测试, 性能测试和压力测试

好的单元测试用例名遵循: (它) 在什么样的情况下是什么行为

### 使用 `Enzyme` 进行 react 组件的测试

有三种渲染方式测试

1. shallow 方式渲染, 一般用于无状态的组件测试
2. mount 方式渲染
3. render 方式渲染

#### 被连接 `connect` 的react组件测试

这类组件需要依赖于一个 `sotre` 实例, 而且能够实实在在提供内容, 书中给出一个简单的示例: 

```js
const store = createStore(
    combineReducers({
        todos: todosReducer,
        filter: filterReducer
    }), {
        todos: [],
        filter: FilterTypes.ALL
    }
)
```

上面创造了一个实际的 `store`. 下一步需要创造 `Provider` 注入到 `store`

```js
const subject = <Provider store={store}>
    <TodoList />
</Provider>

// 挂载 subject dom
const wrapper = mount(subject)

// 通过 `store.dispatch` 函数派发 `action`
store.dispatch(actions.addTodo('write more test`));
// 验证 wrapper 对象上的渲染元素是否发生预期的改变
expect(wrapper.find('.text').text()).toEqual('write more test');
```

### 使用 `redux-mock-store` + `sinon` 进行异步 `action` 的测试

使用 `redux-mock-store` 模拟简易的 `redux` 的 store

使用 `sinon` 库篡改函数的行为

## 拓展Redux

### 中间件

抽象的理解成: 处理请求的管道, 有以下的特点:

1. 独立的函数, 没有互相依赖
2. 可以组合使用, 中间件按照指定顺序一次处理传入的 `action`, 只有但前面的中间件完成任务后, 后面的中间件才有机会继续处理 `action`
3. 统一的接口

#### `redux` 中间件

一个啥事没做的中间件如下:

```js
function doNothingMiddleware ({dispatch, getState}) {
    return function (next) {
        return function (action) {
            return next(action)
        }
    }
}

const doNothingMiddleware = ({dispatch, getState}) => next => action => next(action)
```

`next` 方法用语表示当前的中间件完成了自己的功能, 把控制权交给下一个中间件

### Store Enhancer

极简的 `enhance` 可能是下面这样:

```js
const nothingEnhancer = (createStore) => (reducer, preLoadedState, enhance) => {
    const store = createStore(reducer, preLoadedState, enhance)
    return store
}
```

`enhancer` 增强的重点都在于如何定制产生 `store` 对象, 而 `store` 对象有如下的几个接口:

- `dispatch`
- `subscribe`
- `getState`
- `replaceReducer`

可以装饰方法增强方法的能力, 最后再调用原有的函数.

## react 动画

### 动画的实现方式

#### CSS3 方式
即依赖 CSS3 的 `transition` 语法, 让规则作用在指定的 `DOM` 上

优势在于性能, 但是因为是浏览器 CSS 控制, 所以当动画开始时无法执行中断

#### 脚本方式