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

`stated(<states: Object>) -> <Stated>`
`new Stated(<states: Object>) -> <Stated>`

To create an instance of Stated pass a 'states' object. A valid states object
must, at a minimum, have an 'initial' state object.

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

`stated.has(<action: String>[, <updateValue: Any>]) -> <Stated>`

Transition from the current state to a new state. If called with a second
argument. The value of the new state will be updated with the value. If value
is an Object, the current value and `updateValue` will be merged. If the
`updateValue` is not an Object, value will be replaced with `updateValue`.

`actions` only has values for actions related to the current state. So
attempting to call `has` with an invalid action will cause a runtime error
as that action will not exist on `<stated>.actions`.

```js
  h20.has(h20.actions.FROZEN);

  h20.state; //-> 'ice'
  h20.value; //-> '32F'

  h20.has(h20.actions.BOILED, { state: 'gas' });

  h20.value; //-> { state: 'gas', temp: '212F' }
```

`stated.to(<action: String>[, <updateValue: Any>]) -> <Stated>`

'to' is an alias for 'has'.

```js
  h20.to(h20.actions.BOILED);

  h20.state; //-> 'steam'
  h20.value; //-> { state: 'ice', temp: '212F' }

  h20.to(h20.actions.FROZEN, '0C');

  h20.value; //-> '0C'
```

`stated.is(<action: String[, <updateValue: Any>]>) -> <Stated>`

'is' is an alias for 'has'

```js
  h20.is(h20.actions.BOILED);

  h20.state; //-> 'steam'
  h20.value; //-> { state: 'ice', temp: '212F' }

  h20.is(h20.actions.FROZEN, '0C');

  h20.value; //-> '0C'
```

`stated.initial() -> <Stated>`

Set the Stated object's state to 'initial'.

```js
  h20.initial();

  h20.state; //-> 'initial'
  h20.value; //-> '60F'
```

`stated.actions -> <actions: Object>`

Return an object with actions as properties and associated values. Provided to
avoid typos when traversing states. For example:

```js
h20.has(h20.actions.BOILED);
h20.actions;

//-> { 'FROZEN': 'FROZEN', 'COOLED': 'COOLED' }
```

`stated.state -> <state: String>`

Return the name of the Stated's current state.

```js
  h20.state;

  //-> 'steam'
```

`stated.value -> <value: Any>`

Returns the value of the current state if one exists; returns `undefined`
if not.

```js
  h20.has(h20.actions.WARMED);
  h20.value;

  //-> '60F'
```
