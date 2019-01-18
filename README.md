[![Build Status](https://travis-ci.com/mjstahl/stated.svg?branch=master)](https://travis-ci.com/mjstahl/stated)

# Stated
Simply put state management for your JavaScript application.

## Installation

```js
$ npm install --save @mjstahl/stated
```

```js
// as a factory function
const stated = require('@mjstahl/stated');

// as a class expression
const { Stated } = require('@mjstahl/stated');
```

## API

`stated(states: Object[, persistant: Boolean]) -> Stated`

`new Stated(states: Object[, persistant: Boolean]) -> Stated`

To create an instance of Stated pass a 'states' object. A valid states object
must, at a minimum, have an 'initial' state object.

By default each Stated object is persistant and stores each state change,
allowing the user to `undo` and `redo` states. Passing `false` as the
second argument to the constructor will turn this behavior off.

```js
const h20 = stated({
  initial: {
    // actions must reference existing states
    FROZEN: 'ice',
    BOILED: 'steam',
    // Number, Array, Function, Object, etc
    value: '60F'
  },
  ice: {
    BOILED: 'steam',
    WARMED: 'initial',
    value: '32F'
  },
  steam: {
    COOLED: 'initial',
    FROZEN: 'ice',
    value: {
      temp: '212F'
    }
  }
});

h20.state; //-> 'initial'
h20.value; //-> '60F'
```

`<stated>.to(action: String[, updateValue: Any]) -> Stated`

Transition from the current state to a new state. If called with a second
argument. The value of the new state will be updated with the value. If value
is an Object, the current value and `updateValue` will be merged. If the
`updateValue` is not an Object, value will be replaced with `updateValue`.

`actions` only has values for actions related to the current state. So
attempting to call `has` with an invalid action will cause a runtime error
as that action will not exist on `<stated>.actions`.

```js
  h20.to(h20.actions.FROZEN);

  h20.state; //-> 'ice'
  h20.value; //-> '32F'

  h20.to(h20.actions.BOILED, { state: 'gas' });

  h20.value; //-> { state: 'gas', temp: '212F' }
```

`<stated>.initial() -> Stated`

Set the Stated object's state to 'initial'.

```js
  h20.initial();

  h20.state; //-> 'initial'
  h20.value; //-> '60F'
```

`<stated>.actions -> Object`

Return an object with actions as properties and associated values. Provided to
avoid typos when traversing states. For example:

```js
h20.has(h20.actions.BOILED);
h20.actions;

//-> { 'FROZEN': 'FROZEN', 'COOLED': 'COOLED' }
```

`<stated>.state -> String`

Return the name of the Stated's current state.

```js
  h20.state;

  //-> 'steam'
```

`<stated>.value -> Any`

Returns the value of the current state if one exists; returns `undefined`
if not.

```js
  h20.has(h20.actions.WARMED);
  h20.value;

  //-> '60F'
```

## Events

Each stated object is also an EventEmitter. When the Stated object transitions
from one state to another the `'transition'` event is emitted with the Stated
object passed the only argument to the callback.

```js
  h20.on('transition', ({ state, value }) => {
    console.log(state) //-> initial
    console.log(value) //-> '60F'
  })
  h20.initial();
```

## Persistance

By default each Stated object is persistant and stores each state change,
allowing the user to `undo` and `redo` states.

`<stated>.persistant -> Boolean`

Toggle whether the Stated object will store each state change.

```js
h20.persistant //-> true, Stated objects are persistant by default

// To turn off persistance, simply set 'persistant' to 'false'
h20.persistant = false
```

`<stated>.undo() -> Stated`

Return to a previous state. If the current state is `'inital'` and `undo` is
called, the Stated object will be returned without performing a state
transition (in the `'initial'` state).

```js
  h20.has(h20.actions.FROZEN);
  h20.state; //-> 'ice'

  h20.undo()
  h20.state; //-> 'initial'
```

`<stated>.redo() -> Stated`

Re-apply a later state. If the current state is the top of the stack of states
and `redo` is called, the Stated object will be returned without performing a
state transition (the current state will remain equal to the state at the
top of the stack).

```js
  h20.has(h20.actions.FROZEN);
  h20.state; //-> 'ice'

  h20.undo()
  h20.state; //-> 'initial'

  h20.redo()
  h20.state; //-> 'ice'
```
