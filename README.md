# Transiton
That which transitions between states.

`transiton([<initial: String>,] <states: Object>) -> <transiton: Object>`

To create a transiton, (optionally) pass a starting state, and a states
object. If no initial state is specified, `start` is assumed to be the first
state.

A states object has a structure as follows:

```js
const machine = transiton('water', {
  // will be the starting state is no initial state name is provided
  'water': {
    // an edge's value can only be a string, and must be a defined state name
    'FROZEN': 'ice',
    'BOILED': 'steam',
    // any value, string, array, object, etc.
    'value': '60F'
  },
  'ice': {
    'BOILED': 'steam',
    'WARMED': 'water',
    'value': '32F'
  },
  'steam': {
    'COOLED': 'water',
    'FROZEN': 'ice',
    'value': '212F'
  }
});

machine.state; //-> 'water'
machine.value; //-> '60F'
```

`transiton.actions -> <actions: Object>`

Return an object with edges as properties and associated values. Provided to
avoid typos when traversing states. For example:

```js
// starting with the example above
machine.actions;

//-> { 'FROZEN': 'FROZEN', 'BOILED': 'BOILED' }
```

`transiton.has(<edge: String>) -> <transiton: Object>`

Transition from the current state to a new state. `<transiton>.state` now returns
the name of the new state. `<transiton>.value` will return the value of the new
state if one exists, will return `undefined` if not.

`actions` only has values for actions related to the current state. So
attempting to call `has` with an invalid action will cause a runtime error
as that action will not exist on `<transiton>.actions`.

```js
  machine.has(machine.actions.FROZEN);

  machine.state; //-> 'ice'
  machine.value; //-> '32F'
```

`transiton.state -> <state: String>`

Return the name of the transiton's current state.

```js
  machine.state;

  //-> 'ice'
```

`transiton.value -> <value: Any>`

Returns the value of the current state if one exists; returns `undefined`
if not.

```js
  machine.has(machine.actions.BOILED);
  machine.value;

  //-> '212F'
```