# Presentational and Container Components

> 对该文章的解读

[https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

> There’s a simple pattern I find immensely useful when writing React applications. If you’ve been doing React for a while, you have probably already discovered it. This article explains it well, but I want to add a few more points.

没啥好解读的...

>You’ll find your components much easier to reuse and reason about if you **divide them into two categories**. I call them Container and Presentational components* but I also heard Fat and Skinny, Smart and Dumb, Stateful and Pure, Screens and Components, etc. These all are not exactly the same, but the core idea is similar.

将可复用组件分为两个维度: 容器组件和展示组件. 当然还有其它别称:

- 瘦/胖
- 聪明/傻
- 状态组件/无状态(纯)

>My presentational components:
> - Are concerned with how things look.
> - May contain both presentational and container components** inside, and usually have some DOM markup and styles of their own.
> - Often allow containment via this.props.children.
> - Have no dependencies on the rest of the app, such as Flux actions or stores.
> - Don’t specify how the data is loaded or mutated.
> - Receive data and callbacks exclusively via props.
> - Rarely have their own state (when they do, it’s UI state rather than data).
> - Are written as functional components unless they need state, lifecycle hooks, or performance optimizations.
> - Examples: Page, Sidebar, Story, UserInfo, List.

展示型组件有:

- 事物应该长什么样
- 内部可能会包含展示型和容器型组件, 拥有自身的 DOM 结构和样式
- 经常允许包含 `this.props.children` 渠道?
- 不依赖于app的其它部分, 例如 `Flux` 下的 `actions` 和 `stores`
- 不需要声明数据如何被加载和修改
- 只通过 `props` 渠道接收数据和回调
- 几乎没有自己本身的状态, 如果有更多的是UI的状态而非数据的状态
- 被写为一个[功能型组件](https://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#stateless-functional-components), 除非需要状态, 生命周期, 钩子和性能优化
- 举例: Page, SideBar, Story, UserInfo, List

>My container components:
> - Are concerned with how things work.
> - May contain both presentational and container components** inside but usually don’t have any DOM markup of their own except for some wrapping divs, and never have any styles.
> - Provide the data and behavior to presentational or other container components.
> - Call Flux actions and provide these as callbacks to the presentational components.
> - Are often stateful, as they tend to serve as data sources.
> - Are usually generated using higher order components such as connect() from React Redux, createContainer() from Relay, or Container.create() from >Flux Utils, rather than written by hand.
> - Examples: UserPage, FollowersSidebar, StoryContainer, FollowedUserList.

容器型组件有:

- 事物应该如何工作
- 内部可能包含展示型组件和容器组件, 但是经常没有任何`DOM`标签(可能有些 `wrap` div 会包在外部)和任何样式. 
- 提供数据和行为给展示型或者其它容器组件使用
- 调用 `Flux` 下的 `actions`并提供回调给展示型组件
- 有状态的, 倾向服务于数据源
- 更多的这类组件由高阶组件(例如: `connect`, `createContainer`, `Container.create()`) 生成, 而不是手动编写
- 举例: UserPage, FollwersSidebar, StoryContainer, FollowedUserList

> I put them in different folders to make this distinction clear.

将两种类型组件放在不同文件夹下, 用以区分开来

> Benefits of This Approach
> - Better separation of concerns. You understand your app and your UI better by writing components this way.
> - Better reusability. You can use the same presentational component with completely different state sources, and turn those into separate container components that can be further reused.
> - Presentational components are essentially your app’s “palette”. You can put them on a single page and let the designer tweak all their variations without touching the app’s logic. You can run screenshot regression tests on that page.
> - This forces you to extract “layout components” such as Sidebar, Page, ContextMenu and use this.props.children instead of duplicating the same markup and layout in several container components.

这种方式的好处有: 

- 更好的关注点分离, 开发人员通过这种方式, 能更好的理解应用和UI
- 更好的复用性. 使用完全不同的数据源应用到同一个展示型组件, 就会变成一个独立的容器组件进行进一步的重用.
- 展示型组件本质上而言是你引用的**"颜料"**, 你能将其放到一个页面上让设计师调整设计而不用接触到应用的任何逻辑. 甚至可以在页面上执行屏幕回归测试
- 这能强制你提取出 `layout components` 组件, 例如 `Sidebar`, `Page`, `ContextMenu`. 在这些容器组件中使用 `this.props.children` 而不是使用重复相同的标签和布局

> **Remember, components don’t have to emit DOM. They only need to provide composition boundaries between UI concerns.**

组件不是必须产生 `DOM`, 他们只需要给UI之间提供组合界限

> When to Introduce Containers?
> I suggest you to start building your app with just presentational components first. Eventually you’ll realize that you are passing too many props down the intermediate components. When you notice that some components don’t use the props they receive but merely forward them down and you have to rewire all those intermediate components any time the children need more data, it’s a good time to introduce some container components. This way you can get the data and the behavior props to the leaf components without burdening the unrelated components in the middle of the tree.
> This is an ongoing process of refactoring so don’t try to get it right the first time. As you experiment with this pattern, you will develop an intuitive sense for when it’s time to extract some containers, just like you know when it’s time to extract a function. My free Redux Egghead series might help you with that too!

## 何时引入容器? 

作者建议在开始构建应用时 只先构建出展示型组件. 最终你会意识到你传递太多的`props`到中介的组件中. 当你注意到有一些组件, 没有使用到接收到的 `props` 数据只是将这些 `props` 传递下去并且你必须在任何时候, 子组件需要更多数据时重新连接所有中间组件, 此时就是一个合适的时机去引入容器组件. 这种方式能让你获取数据和`props` 行为给叶子组件而不会增加树中不相关的组件

重构是一个行进的过程, 所以不需要一开始就尝试. 随着这种模式的尝试, 你会培养出一种何时可以提取容器组件的直接, 就像你知道何时提取一个函数. 

> Other Dichotomies
> It’s important that you understand that the distinction between the presentational components and the containers is not a technical one. Rather, it is a distinction in their purpose.

## 其它二分法

非常重要的一点在于, 理解展示组件和容器组件的区别不在于技术而在于它们的目的

相反, 这里有一些相关(但不同)的技术上的区别:

> - Stateful and Stateless. Some components use React setState() method and some don’t. While container components tend to be stateful and presentational components tend to be stateless, this is not a hard rule. Presentational components can be stateful, and containers can be stateless too.
> - Classes and Functions. Since React 0.14, components can be declared both as classes and as functions. Functional components are simpler to define but they lack certain features currently available only to class components. Some of these restrictions may go away in the future but they exist today. Because functional components are easier to understand, I suggest you to use them unless you need state, lifecycle hooks, or performance optimizations, which are only available to the class components at this time.
> - Pure and Impure. People say that a component is pure if it is guaranteed to return the same result given the same props and state. Pure components can be defined both as classes and functions, and can be both stateful and stateless. Another important aspect of pure components is that they don’t rely on deep mutations in props or state, so their rendering performance can be optimized by a shallow comparison in their shouldComponentUpdate() hook. Currently only classes can define shouldComponentUpdate() but that may change in the future.

- **有状态和无状态**

一些组件使用 `React.setState()` 方法有一些没有, 当容器组件倾向于有状态而展示型组件倾向于无状态, 这并不是一个硬性规则. 展示型组件可以是状态的, 容器型组件可以是无状态的

- **Classes and Functions**

从 `React` **0.14**  之后, 组件可以同个 `classes` 或者 `functions`来声明. 函数式的组件声明定义更简单, 但是它们缺少一些只能通过 `classes` 声明才能使用的特性. 一些限制条件未来可能会移除, 但当下还是存在. 因为函数式的组件更容易理解, 我建议除非你需要 `state`, `lifecycle`, `hooks` 或者性能优化这些只能在`classes`才拥有的特性时, 使用函数型组件.

- **Pure and Impure**

所谓的纯组件是能保证同样的 `props` 和 `state` 返回相同的结果。纯组件既可以定义成类也可以定义成行数, 并且可以是有状态或者无状态的。另一个重要的概念是纯组件不依赖`props` 或者 `state` 的深层次变化, 所以他们的渲染性能能通过sholudComponentUpdate浅比较得到优化

当前 `sholudComponentUpdate` 只能通过类声明组件的方式定义

> Both presentational components and containers can fall into either of those buckets. In my experience, presentational components tend to be stateless pure functions, and containers tend to be stateful pure classes. However this is not a rule but an observation, and I’ve seen the exact opposite cases that made sense in specific circumstances.

无论展示型组件还是容器型组件都可以按这几种分型，在我的经验中，展示型组件倾向于无状态纯行数， 容器型组件倾向于有状态的纯类组件。然而这不是一个规则而是一种观察，我也在一些特殊的场景下看到确切相反的案例

> Don’t take the presentational and container component separation as a dogma. Sometimes it doesn’t matter or it’s hard to draw the line. If you feel unsure about whether a specific component should be presentational or a container, it might be too early to decide. Don’t sweat it!

不要教条式的区分展示型组件和容器型组件，有时候它不是必要和困难的将其划线关联。如果你不确定一个组件是展示型还是容器型的，那可能是你太早去确定了，打住吧