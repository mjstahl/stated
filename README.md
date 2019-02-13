[![Build Status](https://travis-ci.com/mjstahl/stated.svg?branch=master)](https://travis-ci.com/mjstahl/stated)

# Stated
Simply put state management for your JavaScript application. Pushdown automata
(FSM with history) in less than 1KB.

## Installation

```js
$ npm install --save @mjstahl/stated
```

```js
// as a factory function
const stated = require('@mjstahl/stated')

// as a class expression
const { Stated } = require('@mjstahl/stated')
```

## API

`stated(states: Object[, persistent: Boolean]) -> Stated`

`new Stated(states: Object[, persistent: Boolean]) -> Stated`

To create an instance of Stated pass a 'states' object. A valid states object
must have an, at least, a single state. `initial` states can be set after
instantiation by assign a valid state to the `initial` property.

By default each Stated object is not persistent. If you wish to store
each state change pass 'true' as the second argument to the constructor.

```js
const h20 = stated({
  initial: 'water',
  water: {
    // actions must reference existing states
    FROZEN: 'ice',
    BOILED: 'steam',
    // Number, Array, Function, Object, etc
    value: '60F'
  },
  ice: {
    BOILED: 'steam',
    WARMED: 'water',
    value: '32F'
  },
  steam: {
    COOLED: 'water',
    FROZEN: 'ice',
    value: {
      temp: '212F'
    }
  }
})

h20.state //-> 'water'
h20.value //-> '60F'
```

`<stated>.to(action: String[, updateValue: Any]) -> Stated`

Transition from the current state to a new state. If called with a second
argument. The value of the new state will be updated with the value. If value
is an Object, the current value and `updateValue` will be merged. If the
`updateValue` is not an Object, value will be replaced with `updateValue`.

```js
  h20.to(h20.actions.FROZEN)

  h20.state //-> 'ice'
  h20.value //-> '32F'

  h20.to(h20.actions.BOILED, { state: 'gas' })

  h20.value //-> { state: 'gas', temp: '212F' }
```

`<stated>.reset() -> Stated`

Set the Stated object's state to initial state.

```js
  h20.reset()

  h20.state //-> 'water'
  h20.value //-> '60F'
```

`<stated>.actions -> Object`

Return an object with actions as properties and associated values. Provided to
avoid typos when traversing states. For example:

```js
h20.to(h20.actions.BOILED)
h20.actions

//-> { 'FROZEN': 'FROZEN', 'COOLED': 'COOLED' }
```

`actions` only includes actions related to the current state. So
attempting to call `to` with an invalid action will cause a runtime error
as that action does not exist on `<stated>.actions`.

**For a state that does not have any `actions` all the states of the Stated
object will available from `actions`.**

`<stated>.state -> String`

Return the name of the Stated's current state.

```js
  h20.state

  //-> 'steam'
```

`<stated>.value -> Any`

Returns the value of the current state if one exists; returns `undefined`
if not.

```js
  h20.to(h20.actions.WARMED)
  h20.value

  //-> '60F'
```

`<stated>.via -> Object`

Return an object with actions as properties and the state they point to as
values.

```js
h20.to(h20.actions.FROZEN)
h20.via

//-> { BOILED: 'steam', WARMED: 'water' }
```

## Guards

Each state may have a `canEnter` and `canLeave` function that is executed
when attempting to leave one state and enter another. Each function takes
one argument, the Stated object, for use during its execution.

When a transition is occurring (via the `on` method), if there is a `canLeave` function on the current state, it is executed. If the `canLeave` function returns `true` and the future state has a `canEnter` function, the `canEnter` function is
executed. If the `canEnter` function of the future state returns true, the Stated object is transitioned successfully.

If either the `canLeave` or `canEnter` functions exist and return false, the transition does not occur.

`.canLeave(self: Stated) -> Boolean`

`.canEnter(self: Stated) -> Boolean`

## Transition Functions

Each state can have an `onLeave` and `onEnter` function that is executed when
leaving one state, and having entered another. This are useful for performing
side-effects.

`.onLeave(self: Stated) -> Void`

Executed when a transition is to occur but before the current state has been
replaced with the next state.

```js
const h20 = stated({
  initial: 'water',
  water: {
    FROZEN: 'ice',
    value: '60F'
    onLeave: () => console.log('Winter is Coming!!!')
  },
  ice: {
    WARMED: 'water',
    value: '32F'
  },
})

h20.to(h20.actions.FROZEN)

//-> 'Winter is Coming!!!'
```

`.onEnter(self: Stated) -> Void`

Executed after the state and values have been updated, history has recorded (if
persistent), and `'transition'` event has been emitted.

```js
const h20 = stated({
  initial: 'water',
  water: {
    FROZEN: 'ice',
    value: '60F'
    onLeave: () => console.log('Winter is Coming!!!')
  },
  ice: {
    WARMED: 'water',
    value: '32F'
    onEnter: () => console.log('Winter is Here!!!')
  },
})

h20.to(h20.actions.FROZEN)

//-> 'Winter is Coming!!!'
//-> 'Winter is Here!!!'
```

## Events

Each stated object is also an EventEmitter. When the Stated object transitions
from one state to another all callbacks passed to the `onTransition` function are evaluated with the Stated object passed the only argument to the callback. `onTransition` returns a function that unsubscribes when executed.

`<stated>.onTransition(callback: Function) -> unsubscribe: Function`

```js
  const unbind = h20.onTransition(({ state, value }) => {
    console.log(state) //-> 'water'
    console.log(value) //-> '60F'
  })
  h20.reset()

  // when you are finished listening
  unbind()
```

## Persistence

Each Stated object is can be persistent and store each state change,
allowing the user to `undo` and `redo` states. Use can turn persistence
on and off with the `persistent` property. You can make Stated object
persistent by default by passing `true` as the second argument to the
constructor.

`<stated>.persistent -> Boolean`

`new Stated({... states, true})`

Toggle whether the Stated object will store each state change.

```js
h20.persistant //-> false, Stated objects are not persistent by default

// To turn on persistence, simply set 'persistent' to 'true'
h20.persistent = true
```

`<stated>.undo() -> Stated`

Return to a previous state. If the current state is the initial state and
`undo` is called, the Stated object will be returned without performing a
state transition (in the initial state).

```js
  h20.to(h20.actions.FROZEN)
  h20.state //-> 'ice'

  h20.undo()
  h20.state //-> 'water'
```

`<stated>.redo() -> Stated`

Re-apply a later state. If the current state is the top of the stack of states
and `redo` is called, the Stated object will be returned without performing a
state transition (the current state will remain equal to the state at the
top of the stack).

```js
  h20.to(h20.actions.FROZEN)
  h20.state //-> 'ice'

  h20.undo()
  h20.state //-> 'water'

  h20.redo()
  h20.state //-> 'ice'
```
