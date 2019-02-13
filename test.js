const test = require('ava')
const stated = require('./index')

const states = {
  initial: 'water',
  water: {
    FROZEN: 'ice',
    BOILED: 'steam',
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
}

test('newly created instance', t => {
  t.plan(4)
  const state = stated(states)
  t.truthy(state, 'Stated created successfully')
  t.is(state.state, state.__states['initial'],
    'initial state is correct')
  t.is(state.value, '60F',
    'value is correctly set to states value')
  t.deepEqual(state.actions, { FROZEN: 'FROZEN', BOILED: 'BOILED' },
    'initial actions are correct')
})

test('via returns the names of states that actions point to', t => {
  t.plan(1)
  const state = stated(states)
  t.deepEqual(state.via, { FROZEN: 'ice', BOILED: 'steam' },
    'initial via values are correct')
})

test('transition to new state', t => {
  t.plan(3)
  const state = stated(states)
  state.to(state.actions.FROZEN)
  t.is(state.state, 'ice',
    'transitioned to new state successfully')
  t.is(state.value, '32F',
    'value is correctly set to states value')
  t.deepEqual(state.actions, { BOILED: 'BOILED', WARMED: 'WARMED' },
    'updated actions are correct')
})

test('return to initial state', t => {
  t.plan(1)
  const state = stated(states)
  state.reset()
  t.is(state.value, '60F', 'value is correctly set to initial value')
})

test('transition to new state using to', t => {
  t.plan(2)
  const state = stated(states)
  state.to(state.actions.FROZEN)
  t.is(state.state, 'ice',
    'transitioned to new state successfully')
  t.deepEqual(state.actions, { BOILED: 'BOILED', WARMED: 'WARMED' },
    'updated actions are correct')
})

test('to allows an update to state w/ primitive', t => {
  t.plan(1)
  const state = stated(states)
  state.to(state.actions.FROZEN, '32F')
  t.is(state.value, '32F',
    'value is correctly set to states value')
})

test('to allows an update to state w/ object', t => {
  t.plan(1)
  const state = stated(states)
  state.to(state.actions.BOILED, { state: 'gas' })
  t.deepEqual(state.value, { temp: '212F', state: 'gas' },
    'value is correctly set to states value')
})

test('export as object', t => {
  t.plan(1)
  const { Stated } = require('./index')
  const state = new Stated(states)
  state.to(state.actions.FROZEN, '75F')
  t.is(state.value, '75F',
    'value is correctly set to states value')
})

test('emits "transition" event when state is changed', t => {
  t.plan(3)
  const state = stated(states)
  state.onTransition(({ state, actions, value }) => {
    t.truthy(actions.BOILED,
      '"actions" property is available on the argument')
    t.is(state, 'ice',
      'correct state is applied and passed')
    t.is(value, '75F',
      '"transition" event passes the stated object as the cb argument')
  })
  state.to(state.actions.FROZEN, '75F')
})

test('persists history when second argument is true, starting with "initial"', t => {
  t.plan(3)
  const state = stated(states, true)
  t.is(state.__history.length, 1, 'history is persisted with "initial" state')
  const current = state.__current
  t.is(state.__current, 0, 'state pointer is set to the first state in history')
  t.is(state.__history[current].state, state.__states['initial'], '"initial" state is in history')
})

test('turning on "persistent" will start recording history', t => {
  t.plan(2)
  const state = stated(states)
  state.to(state.actions.FROZEN)
  t.is(state.__history.length, 0, 'persistent by default')
  state.persistent = true
  state.to(state.actions.BOILED)
  t.is(state.__history.length, 1, 'turning off persistent does not add history')
})

test('"undo" and "redo" are no-ops when history.length is 0', t => {
  t.plan(2)
  const state = stated(states)
  state.undo()
  t.is(state.state, state.__states['initial'], '"undo" will not go below 0')
  state.redo()
  t.is(state.state, state.__states['initial'], '"redo" will not exceed __history.lenght - 1')
})

test('"undo" rewinds state history', t => {
  const state = stated(states, true)
  state.to(state.actions.FROZEN)
  state.to(state.actions.BOILED)
  state.undo()
  t.is(state.state, 'ice', '"undo" undoes single state in history')
})

test('"redo" applies previously recorded states', t => {
  const state = stated(states, true)
  state.to(state.actions.FROZEN)
  state.to(state.actions.BOILED)
  state.undo()
  state.redo()
  t.is(state.state, 'steam', '"undo" undoes single state in history')
})

test('"actions" do not include "value", "onLeave", "onEnter"', t => {
  t.plan(3)
  const state = stated(states)
  const actions = Object.keys(state.actions)
  t.truthy(!actions.includes('value'), '"actions" does not include "value"')
  t.truthy(!actions.includes('onEnter'), '"actions" does not include "onEnter"')
  t.truthy(!actions.includes('onLeave'), '"actions" does not include "onLeave"')
})

test('"onEnter" and "onLeave" receive the Stated object', t => {
  t.plan(3)
  const state = stated({
    initial: 'water',
    water: {
      FROZEN: 'ice',
      value: '60F',
      onLeave: (self) => t.is(self, state)
    },
    ice: {
      value: '32F',
      onEnter: (self) => t.is(self, state)
    }
  })
  state.to(state.actions.FROZEN)
  t.is(state.state, 'ice')
})

test('"onLeave" function is executed when exiting a state', t => {
  t.plan(1)
  const state = stated({
    initial: 'water',
    water: {
      FROZEN: 'ice',
      value: '60F',
      onLeave: () => t.pass()
    },
    ice: {
      value: '32F'
    }
  })
  state.to(state.actions.FROZEN)
})

test('"onEnter" function is executed when a state is entered', t => {
  t.plan(1)
  const state = stated({
    initial: 'water',
    water: {
      FROZEN: 'ice',
      value: '60F'
    },
    ice: {
      value: '32F',
      onEnter: () => t.pass()
    }
  })
  state.to(state.actions.FROZEN)
})

test('"canEnter" and "canLeave" receive the Stated object', t => {
  t.plan(1)
  const state = stated({
    initial: 'water',
    water: {
      FROZEN: 'ice',
      value: '60F',
      canLeave: (self) => self === state
    },
    ice: {
      value: '32F',
      canEnter: (self) => self === state
    }
  })
  state.to(state.actions.FROZEN)
  t.is(state.state, 'ice')
})

test('"canEnter" is ignored during creation or resetting', t => {
  t.plan(2)
  const state = stated({
    initial: 'water',
    water: {
      FROZEN: 'ice',
      value: '60F',
      canEnter: () => false
    },
    ice: {
      value: '32F'
    }
  })
  t.is(state.state, 'water')
  state.to(state.actions.FROZEN)
  state.reset()
  t.is(state.state, 'water')
})

test('"canLeave" function stops a transition when false', t => {
  t.plan(1)
  const state = stated({
    initial: 'water',
    water: {
      FROZEN: 'ice',
      value: '60F',
      canLeave: () => false
    },
    ice: {
      value: '32F'
    }
  })
  state.to(state.actions.FROZEN)
  t.is(state.state, 'water')
})

test('"canEnter" function stops a transition when false', t => {
  t.plan(1)
  const state = stated({
    initial: 'water',
    water: {
      FROZEN: 'ice',
      value: '60F'
    },
    ice: {
      value: '32F',
      canEnter: () => false
    }
  })
  state.to(state.actions.FROZEN)
  t.is(state.state, 'water')
})

test('"canLeave" is ignored during a reset', t => {
  t.plan(1)
  const state = stated({
    initial: 'water',
    water: {
      FROZEN: 'ice',
      value: '60F'
    },
    ice: {
      value: '32F',
      canLeave: () => false
    }
  })
  state.to(state.actions.FROZEN)
  state.reset()
  t.is(state.state, 'water')
})

test('states without actions can use navigate to all states', t => {
  t.plan(2)
  const state = stated({
    initial: 'water',
    water: {
      value: '60F'
    },
    ice: {
      value: '32F',
      canLeave: () => false
    }
  })
  t.deepEqual(state.actions, { water: 'water', ice: 'ice' })

  state.to(state.actions.water)
  t.is(state.state, 'water')
})

test('"initial" state is no longer required', t => {
  t.plan(2)
  const state = stated({
    water: {
      value: '60F'
    },
    ice: {
      value: '32F',
      canLeave: () => false
    }
  })
  t.is(state.state, undefined)

  state.initial = state.actions.water
  t.is(state.state, 'water')
})
