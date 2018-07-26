# Transiton
That which transitions between states.

`new Transiton(<states: Object>) -> <Transiton>`

To create a Transiton pass a states object. A valid states object must, at a
minimum, have an 'initial' state object.

```js
const Transiton = require('transiton');
const h20 = new Transiton({
  initial: {
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
    // if 'value' is a function it will be called
    value() { return '212F' }
  }
});

h20.state; //-> 'initial'
h20.value; //-> '60F'
```

`transiton.actions -> <actions: Object>`

Return an object with actions as properties and associated values. Provided to
avoid typos when traversing states. For example:

```js
// starting with the example above
h20.actions;

//-> { 'FROZEN': 'FROZEN', 'BOILED': 'BOILED' }
```

`transiton.has(<action: String>) -> <Transiton>`

Transition from the current state to a new state. `<transiton>.state` now returns
the name of the new state. `<transiton>.value` will return the value of the new
state if one exists, will return `undefined` if not.

`actions` only has values for actions related to the current state. So
attempting to call `has` with an invalid action will cause a runtime error
as that action will not exist on `<transiton>.actions`.

```js
  h20.has(h20.actions.FROZEN);

  h20.state; //-> 'ice'
  h20.value; //-> '32F'
```

`transiton.state -> <state: String>`

Return the name of the transiton's current state.

```js
  h20.state;

  //-> 'ice'
```

`transiton.value -> <value: Any>`

Returns the value of the current state if one exists; returns `undefined`
if not. If the type of 'value' is `'function'`, it will be evaluated and the
result will be returned.

```js
  h20.has(h20.actions.BOILED);
  h20.value;

  //-> '212F'
```