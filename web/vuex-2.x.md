> [http://vuex.vuejs.org/zh-cn/](http://vuex.vuejs.org/zh-cn/)

# State

## 单一状态树

用一个对象包含全部的应用层级状态. 至此作为一个 "唯一数据源 [SSOT](https://en.wikipedia.org/wiki/Single_source_of_truth)"

因此意味着每个应用将只包含一个 store 实例

## 在Vue组件中获取Vuex状态

> 由于 Vuex 的状态存储是响应式的，从 store 实例中读取状态最简单的方法就是在[计算属性](http://cn.vuejs.org/guide/computed.html)中返回某个状态

调用 `Vue.use(Vuex)`后, Vuex 通过 `store` 选项, 提供一种机制将状态从根组件注入到每个子组件中.

如下, 先注入到根组件中

```javascript
const app = new Vue({
    el:  '#app',
    // 把 store 对象提供给 “store” 选项，这可以把 store 的实例注入所有的子组件
    store,
    components: { Counter },
    template: ` <div class="app"> <counter></counter> </div> `
})
```

而后在根组件下的所有子组件中, 子组件能通过 `this.$store` 访问到, 如下:

```javascript
const Counter = {
    template: `<div>{{ count }}</div>`,
    computed: {
        count () {
            return this.$store.state.count
        }
    }
}
```

## `mapState` 辅助函数

```javascript
// 在单独构建的版本中辅助函数为 Vuex.mapState
import  { mapState }  from  'vuex'
export default {
    // ...
    computed: mapState({
        // 箭头函数可使代码更简练
        count: state => state.count,
        // 传字符串参数 'count' 等同于 `state => state.count`
        countAlias:  'count',
        // 为了能够使用 `this` 获取局部状态，必须使用常规函数
        countPlusLocalState (state)  {
            return state.count +  this.localCount
        }
    })
}
```

若计算属性与 state 自己诶单名称相同, 允许直接传递一个字符串数组

```javascript
computed: mapState([
    // 映射 this.count 为 store.state.count
    'count'
])
```
## 对象展开运算符

`mapState` 函数返回一个对象, 需要跟局部计算属性混合使用时, 可以如下来使用:

```javascript
computed: {
    localComputed() {},
    // 使用对象展开运算符将此对象混入到外部对象中
    ...mapState({
        // ...
    })
}
```

## 组件仍然保有局部状态

> 使用 Vuex 并不意味着你需要将所有的状态放入 Vuex。虽然将所有的状态放到 Vuex 会使状态变化更显式和易调试，但也会使代码变得冗长和不直观。如果有些状态严格属于单个组件，最好还是作为组件的局部状态。你应该根据你的应用开发需要进行权衡和确定。

# Getters

store 中定义的 `getters` 可以认为是 store 的计算属性. 接受 `state` 为第一个参数, 其它`getters`作为第二参数. 官网例子如下:

```javascript
const store = new Vuex.Store({
  state: {
    todos: [
      { id: 1, text: '...', done: true },
      { id: 2, text: '...', done: false }
    ]
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done)
    }
  }
})

// 在组件中使用如下:
computed: {
    doneTodosCount () {
        return this.$store.getters.doneTodosCount
    }
}
```

在 getters 中定义的属性会通过 `store.getters` 对象暴露出来

## `mapGetters` 辅助函数

类似 `mapState`, 将 store 中的 `getters` 映射到局部计算属性中

```javascript
import { mapGetters } from 'vuex'

export default {
  // ...
  computed: {
  // 使用对象展开运算符将 getters 混入 computed 对象中
    ...mapGetters([
      'doneTodosCount',
      'anotherGetter',
      // ...
    ])
  }
}
```

也可以通过传入对象, 重新配置属性的名称:

```javascript
mapGetters({
  // 映射 this.doneCount 为 store.getters.doneTodosCount
  doneCount: 'doneTodosCount'
})
```

# Mutations

**更改Vuex的store中状态的唯一方式是提交 `mutation`**. `mutation` 概念上类似于事件.

每个 `mutation` 对应一个字符串的事件类型, 以及对应的一个回调函数. **不允许直接调用一个 mutation handler(即回调函数).** 当触发一个事件时, 调用这个函数, 如下:

```javascript
const store = new Vuex.Store({
  state: {
    count: 1
  },
  mutations: {
    increment (state) {
      // 变更状态
      state.count++
    }
  }
})
```

要唤醒一个 mutation handler, 需要调用 `store.commit` 方法如下:

```javascript
store.commit('someType')
```

## 提交载荷 (Payload)

`store.commit` 传入额外的参数, 即 **载荷(payload)**

```javascript
// ...
mutations: {
  increment (state, payload) {
    state.count += payload.amount
  }
}
store.commit('increment', {
  amount: 10
})

computed: {
    count() {
        if (this.doneCount > 10) {
            return this.doneCount;
        } else {
            return this.undoneCount;
        }
    }
}
```

### 对象风格提交

```javascript
store.commit({
  type: 'increment',
  amount: 10
})
```

其中 `type` 就是对应的 mutation 事件类型, 注意的这种方式会将整个对象传递给 handler

## 遵守Vue的响应规则

1. 最好在 store 中初始化好所有属性
2. 添加新属性

    - 使用 `Vue.set(obj, property, value)`
    - 用新对象替换老对象:

    ```javascript
    state.obj = { ...state.obj, newProp: 123 }
    ```

## 用常量代替 Mutation 事件类型

将事件类型放在单独的文件中, 官网推荐如下:

```javascript
// mutation-types.js
export const SOME_MUTATION = 'SOME_MUTATION'
```

```javascript
// store.js
import Vuex from 'vuex'
import { SOME_MUTATION } from './mutation-types'

const store = new Vuex.Store({
  state: { ... },
  mutations: {
    // 我们可以使用 ES2015 风格的计算属性命名功能来使用一个常量作为函数名
    [SOME_MUTATION] (state) {
      // mutate state
    }
  }
})
```

## mutation 必须是同步函数

为了让 devtools 能捕捉到 mutation 中前一状态和后一状态的改变, 时可以追踪的.

## 在组件中提交 Mutations

- 在组件中使用 `this.$store.commit('xxx')`
- 使用 `mapMutations` 辅助函数将组件中的 `methods` 映射为 `store.commit` 调用, **需要在根节点注入 `store`**

```javascript
import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment' // 映射 this.increment() 为 this.$store.commit('increment')
    ]),
    ...mapMutations({
      add: 'increment' // 映射 this.add() 为 this.$store.commit('increment')
    })
  }
}
```

所以, **`mutaion`都是同步事务**

```javascript
    store.commit('increment')
    // 任何由 "increment" 导致的状态变更都应该在此刻完成。
```

# Actions

- Action 提交的是 mutation, 而不是直接变更状态
- Action 可以包含任意异步操作

注册 action 如下:

```javascript
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  }
})
```

其中, action 方法传入的参数 `context` 是一个与 `store` 实例具有相同方法和属性的对象, 因此允许通过 `context.commit` 做一个 mutation 提交.

同样也允许通过 `context.state` 和 `context.getters` 来获取 `state` 和 `getters`.

使用解构简化操作:
```javascript
actions: {
  increment ({ commit }) {
    commit('increment')
  }
}
```

## 分发 Action

使用 `store.dispatch` 方法触发 Action
```javascript
store.dispatch('increment');
```

### 不同于 mutation

1. 在action内部允许异步操作

```javascript
    actions: {
      incrementAsync ({ commit }) {
        setTimeout(() => {
          commit('increment')
        }, 1000)
      }
    }
```

2. 支持载荷方式和对象方式进行分发

```js
// 以载荷形式分发
    store.dispatch('incrementAsync', {
      amount: 10
    })

    // 以对象形式分发
    store.dispatch({
      type: 'incrementAsync',
      amount: 10
    })
```

## 组件中分发 Action

- 直接在组件中使用 `this.$store.dispatch('xxx')` 分发action
- 使用 `mapActions` 将组件的 `methods` 映射为 `store.dispatch` 调用, **(需要在根节点注入 `store`)**

```js
import { mapActions } from 'vuex'

export default {
  // ...
  methods: {
    ...mapActions([
      'increment'
      // 映射 this.increment() 为 this.$store.dispatch('increment')
    ]),
    ...mapActions({
      add: 'increment'
      // 映射 this.add() 为 this.$store.dispatch('increment')
    })
  }
}
```

## 组合 actions

**`store.dispatch` 可以处理被触发的 action 的回调函数返回的 `Promise`**, 并且 `store.dispatch` 仍旧返回 `Promise`

```js
actions: {
    actionA ({ commit }) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
}

store.dispatch('actionA').then(() => {})

// 另一个 action
actions: {
    actionB: ({dispatch, commit}) {
        return dispatch('actionA').then(() => {
            commit('someOtherMutation')
        });
    }
}
```

使用 [`async / await`](https://tc39.github.io/ecmascript-asyncawait/) 特性:

```js
actions: {
  async actionA ({ commit }) {
    commit('gotData', await getData())
  },
  async actionB ({ dispatch, commit }) {
    await dispatch('actionA') // 等待 actionA 完成
    commit('gotOtherData', await getOtherData())
  }
}
```

> 一个 `store.dispatch` 在不同模块中可以触发多个 action 函数。在这种情况下，只有当所有触发函数完成后，返回的 Promise 才会执行。

# Modules

为了避免因为单一状态树, 导致状态集中到一个很大的对象十分臃肿.
因此需要将 `store` 分割成 **模块(modules)**

**每个模块拥有自己的 `state, mutation, action, getters`**

```js
const moduleA = {
  state: { ... },
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: { ... },
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

## 模块的局部状态

- 模块内的 `mutation` 和 `getter`, 接收到的第一个参数是 **模块的局部状态**

其中模块内的 `getter` 根节点状态回座位第三个参数传入

```js
const moduleA = {
  // ...
  getters: {
    sumWithRootCount (state, getters, rootState) {
      return state.count + rootState.count
    }
  }
}
```

- 模块内部的 `action`, `context.state` 是局部状态, 根节点的状态是 `context.rootState`

## 命名空间

模块内部的 action、mutation、和 getter 现在仍然注册在 **全局命名空间**

这样保证了多个模块能够响应同一mutation或action

## 模块动态注册

在 `store` 创建之后, 使用 `store.registerModule` 方法注册模块:

```js
store.registerModule('moduleName', {
    // ...
});
```

使用 `store.unregisterModule(moduleName)` 动态写在模块, **该方法不能呢写在静态模块(在创建 store 时声明的模块)**

# 项目结构和遵守规则

1. 应用层级的状态应该集中到单个 `store` 对象中
2. 提交 `mutation` 是更改状态的唯一方法, **并且这个过程是同步的**
3. 异步逻辑应该封装到 `action` 中

# 插件相关

## 生成 State 快照

简单的一个插件可对状态对象深拷贝

插件如下:

```js
const myPluginWithSnapshot = store => {
  let prevState = _.cloneDeep(store.state)
  store.subscribe((mutation, state) => {
    let nextState = _.cloneDeep(state)

    // 比较 prevState 和 nextState...

    // 保存状态，用于下一次 mutation
    prevState = nextState
  })
}
```

之后便可在 plugins 中加入

> **生成快照的操作应该只在开发阶段使用**

例如

```js
const store = new Vuex.Store({
  // ...
  plugins: process.env.NODE_ENV !== 'production'
    ? [myPluginWithSnapshot]
    : []
})
```

## 内置Logger插件

Vuex自带日志插件, 在目录 `vuex/dist/logger`

```js
import createLogger from 'vuex/dist/logger'

const store = new Vuex.Store({
    plugins: [createLogger()]
})
```

`logger` 带的配置项有:

```js
const logger = createLogger({
  collapsed: false, // 自动展开记录的 mutation
  transformer (state) {
    // 在开始记录之前转换状态
    // 例如，只返回指定的子树
    return state.subTree
  },
  mutationTransformer (mutation) {
    // mutation 按照 { type, payload } 格式记录
    // 我们可以按任意方式格式化
    return mutation.type
  }
})
```

> 日志插件可通过 `<script>` 标签引用, 提供全局方法 `createVuexLogger`
> `logger` 插件生成状态快照

# 严格模式

初始化时传入 `strict: true` 开启严格模式. 在这种模式下当状态的变更不是由 `mutation` 函数引起的, 会抛出错误

为避免性能损失, **请勿在发布环境使用**

# 表单处理

```html
<input v-model="obj.message" />
```

在严格模式中, 当用户输入时, `v-model` 会试着直接修改, 这种情况下是会抛出错误的.

## 处理方式

1. 使用 `:value` 与 `@input` 方式做为响应

```js
<input :value="message" @input="updateMessage">
// ...
computed: {
  ...mapState({
    message: state => state.obj.message
  })
},
methods: {
  updateMessage (e) {
    this.$store.commit('updateMessage', e.target.value)
  }
}
```

2. 绑定计算属性

```js
<input v-model="message">
// ...
computed: {
  message: {
    get () {
      return this.$store.state.obj.message
    },
    set (value) {
      this.$store.commit('updateMessage', value)
    }
  }
}
```

# 测试

## 测试 `mutation`

一个典型的`mutation`测试应该是这个样式

```js
// mutations.js
export const mutations = {
  increment: state => state.count++
}
// mutations.spec.js
import { expect } from 'chai'
import { mutations } from './store'

// 解构 mutations
const { increment } = mutations

describe('mutations', () => {
  it('INCREMENT', () => {
    // 模拟状态
    const state = { count: 0 }
    // 应用 mutation
    increment(state)
    // 断言结果
    expect(state.count).to.equal(1)
  })
})
```

## 测试 `actions`

因为 `action` 多处需要调用外部的api, 所以测试多需要增加一个 mocking 服务层.

> 这个不再赘述

## 测试 `getters`

复杂的 `getter` 应该是需要测试的. 模拟输入在测试输出.

官网给出的例子如下:

```js
// getters.js
export const getters = {
  filteredProducts (state, { filterCategory }) {
    return state.products.filter(product => {
      return product.category === filterCategory
    })
  }
}
// getters.spec.js
import { expect } from 'chai'
import { getters } from './getters'

describe('getters', () => {
  it('filteredProducts', () => {
    // 模拟状态
    const state = {
      products: [
        { id: 1, title: 'Apple', category: 'fruit' },
        { id: 2, title: 'Orange', category: 'fruit' },
        { id: 3, title: 'Carrot', category: 'vegetable' }
      ]
    }
    // 模拟 getter
    const filterCategory = 'fruit'

    // 获取 getter 的结果
    const result = getters.filteredProducts(state, { filterCategory })

    // 断言结果
    expect(result).to.deep.equal([
      { id: 1, title: 'Apple', category: 'fruit' },
      { id: 2, title: 'Orange', category: 'fruit' }
    ])
  })
})
```

## 热重载

使用 `store.hotUpdate()` 进行重载更新

```js
// store.js
import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import moduleA from './modules/a'

Vue.use(Vuex)

const state = { ... }

const store = new Vuex.Store({
  state,
  mutations,
  modules: {
    a: moduleA
  }
})

if (module.hot) {
  // 使 actions 和 mutations 成为可热重载模块
  module.hot.accept(['./mutations', './modules/a'], () => {
    // 获取更新后的模块
    // 因为 babel 6 的模块编译格式问题，这里需要加上 .default
    const newMutations = require('./mutations').default
    const newModuleA = require('./modules/a').default
    // 加载新模块
    store.hotUpdate({
      mutations: newMutations,
      modules: {
        a: newModuleA
      }
    })
  })
}
```

# `Vuex.Stroe` 实例方法

## `subscribe(handler: Function)`

注册监听store的 mutation. `handler` 会在每个 `mutation` 完成后调用，接收 `mutation` 和经过 `mutation` 后的状态作为参数. 常用于插件

**subscribe 还需要补充**
