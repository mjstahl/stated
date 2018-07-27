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

`transiton.has(<action: String>[, <updateValue: Any>]) -> <Transiton>`

Transition from the current state to a new state. If called with a second
argument. The value of the new state will be updated with the value. If value
is an Object, the current value and `updateValue` will be merged. If the
`updateValue` is not an Object, value will be replaced with `updateValue`.

`actions` only has values for actions related to the current state. So
attempting to call `has` with an invalid action will cause a runtime error
as that action will not exist on `<transiton>.actions`.

```js
  h20.has(h20.actions.FROZEN);

  h20.state; //-> 'ice'
  h20.value; //-> '32F'

  h20.has(h20.actions.BOILED, { state: 'gas' });

  h20.value; //-> { state: 'gas', temp: '212F' }
```

`transiton.actions -> <actions: Object>`

Return an object with actions as properties and associated values. Provided to
avoid typos when traversing states. For example:

```js
// starting with the example above
h20.actions;

//-> { 'FROZEN': 'FROZEN', 'COOLED': 'COOLED' }
```

`transiton.state -> <state: String>`

Return the name of the transiton's current state.

```js
  h20.state;

  //-> 'steam'
```

`transiton.value -> <value: Any>`

Returns the value of the current state if one exists; returns `undefined`
if not.

```js
  h20.has(h20.actions.WARMED);
  h20.value;

  //-> '60F'
```