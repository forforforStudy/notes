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

劣势也在于性能不好, 出现卡顿滞后等现象, 动画不流畅等. 但是灵活性更好, 可控性更强.

### `react-addons-css-transition-group` 库

用于帮助 `react` 应用实现动画效果, 主要是结合 `react` 的生命周期使用尤其是装载和卸载过程时使用, 对于更新过程并不是这个库所在解决的问题.

#### 使用方式

```js
const TodoList = (todos) =>{
    return (
        <ul>
            <TransitionGroup transitionName='fade' transitionEnterTimeout={500} transitionLeaveTimeout={200}>
                {
                    todos.map(todo => (
                        <TodoItem key={item.id} id={item.id} text={item.text} completed={item.completed} />
                    ))
                }
            </TransitionGroup>
        </ul>
    )
}
```

其中比较重要的是 `transitionName` 属性, 它关联了 `TransitionGroup` 和 CSS 规则, 上面例子中的 `fade` 代表所有跟这个相关动画的 CSS 类的前缀都是 `fade`

因此这里还需要导入对应的 css 文件: 

```css
.fade-enter {
    opacity: 0.01
}

.fade-enter.fade-enter-active {
    opacity: 1
    transition:opacity 500ms ease-in
}

.fade-leave {
    opacity: 1
}

.fade-leave.fade-leave-active {
    opacity: 0.01
    transition: opacity 200ms ease-in
}
```

- 一般而言定义的类名是上面四个后缀, 由 `enter`/`leave` 定义初始状态, 由对应的 `active` 定义结束状态, 这样有个前后的差异, 才能让 CSS3 以 `transition` 方式实现动画
`TransitionGroup` 会先加上 `fade-enter` 类, 在下一个时钟周期加上 `fade-enter-active`, 从而引起转化过程产生动画. 同理 `leave` 作为卸载组件时调用

- `transitionEnterTimeout` 和 `transitionLeaveTimeout` 一般而言应该与 CSS3 动画定义的 `transition-duration` 保持一致, 不然会产生一种突变的效果

- 装载时, `TransitionGroup` 总是包住整个集合, 如上包住 `<ul>` 标签, 而不是单个对 `<TodoItem>` 进行包裹, 这里的原因是因为 `TransitionGroup` 产生动画必须
等到 `TransitionGroup` 自身装载完毕才能发挥作用, 所以必须要先于动画的组件渲染.

- 在首次装载过程时, `enter` 过程并不包括 `TransitionGroup` 的首次装载, 因此与 `TransitionGroup` 一同实例化的子组件是没有动画效果的, 要实现出现时的效果需要加入
`appear` 过程. 

    1. 开启 `appear` 过程, 即设置 `props` 的 `transitionAppear` 值为 `true` 
    2. 定义动画类 `.fade-appear.fade-appear-active`

### `React-Motion` 动画库

这个库是用脚本的方式实现的, 书中提出了一点: **友好的API比性能更重要, 性能并不会因为采用了脚本方式不用CSS3方式二引起显著的性能下降**

`React-Motion` 有两个概念: **刚度 stiffness** 和 **阻尼 damping**

详细的展开放在这里吧: [https://github.com/chenglou/react-motion](https://github.com/chenglou/react-motion)

核心的几个对象包括: `spring` 函数 ( 用于产生动画属性的开始和结束状态 ) 和 `TransitionMotion` 组件, 用于处理装载过程和卸载过程, 类似上面的 `TransitionGroup` 组件.

## 多页面应用

### 单页应用

1. 不同页面之间的切换不会造成网页的刷新

2. 页面内容和 URL 保持一致

3. 可收藏性, 即复制出一段 URL 到地址栏打开能显示之前相同的页面内容

### `React-Router`

每个 URL 分为 **域名部分** 和 **路径部分**, 决定一个 URL 显示内容的只有路径部分, 和域名端口并没有关系

#### 路由

`React-Router` 来看, 每一个页面其实就是一个大的 React 组件, 当然这个㢟可以包含很多子组件来构成一个复杂的页面.

- `Router`

    整个应用只需要一个实例, 代表整个路由器. `Router` 的子组件只能是 `Route` 和 `IndexRoute`

- `Route`

    代表每一个路径对应的页面路由规则, 一个应用一般有多个 `Route` 实例

- `Link`

    用于路由链接, 点击 `Link` 组件不会引起网页跳转, 而是被 `Link` 截获把目标路径发送给 `Router` 路由器处理切换路由的组件显示.

- `history`
    
    用于管理 js 应用会话历史的库提供历史堆栈, 导航, 调整, 后退等统一的 api, , `history` 分为三种: `browserHistory`, `hashHistory`, `memoryHistory`

    > 相关内容:
    > [https://zhuanlan.zhihu.com/p/20799258?refer=jscss](https://zhuanlan.zhihu.com/p/20799258?refer=jscss)
    > [https://segmentfault.com/a/1190000010251949](https://segmentfault.com/a/1190000010251949)

- `IndexRoute` 

    默认路由, 用于标明当该层路径未空时的默认显示组件

书中给出如下例子: 

```js
const App = ({ children }) => {
    return <div>
        <TopMenu />
        <div>
            { children }
        </div>
    </div>
}

const Routes = () => <Router history={history}>
    <Route path='/' component={App}>
        <Route path='home' component={Home}></Route>
        <Route path='about' component={About}></Route>
        <Route path='*' component={NotFound}></Route>
    </Route>
</Router>
```

`React-Router` 会根据路径匹配层级, 先渲染外层的组件, 然后把内层的 `Route` 组件作为 `children` 属性传递给外层组件.

在上面的例子中, 在渲染`App`组件时, 渲染 `children` 属性就会把内部的 `Home` 组件渲染出来, 这种就是路由的嵌套. 每一层的 `Route` 只决定到这一层的路径, 而非整个路径.

#### 与 `Redux` 的集成

**`react-router-redux`** 库: 用于同步浏览器 `URL` 和 `Redux` 的状态, 它需要这么些事配合: 

1. 需要存入路由信息, 如下

```js
import { routerReducer } from 'react-router-redux'
const reducer = combineReducers({
    routing: routerReducer
})
```

2. 调整 `history` 对象能够协同 `URL` 和 `Store` 上的状态, 当 `URL` 发生变化的时候会向 `store` 派发 `action` 对象, 相反当 `routing` 发生变化的时候会更新浏览器 `URL`, 例如:

```js
import { syncHistoryWithStore } from 'react-router-redux'
const history = syncHistoryWithStore(history, store)
```

在 **redux-devtools** 上可以看到有个 `@@router/LOCATION_CHANGE` 的 `action` 被派发

### 代码分片

多概念性东西, 这里提出一点

`CommonsChunkPlugin` 会提取出所有分片中的共同代码. 这里 `CommonsChunkPlugin` 不展开, 这里提出一个比较好的说明: [https://github.com/creeperyang/blog/issues/37](https://github.com/creeperyang/blog/issues/37)

