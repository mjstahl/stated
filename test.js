const test = require('ava')
const stated = require('./index')

const states = {
  initial: {
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
  t.is(state.state, 'initial',
    'initial state is correct')
  t.is(state.value, '60F',
    'value is correctly set to states value')
  t.deepEqual(state.actions, { FROZEN: 'FROZEN', BOILED: 'BOILED' },
    'initial actions are correct')
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

test('has allows an update to state w/ primitive', t => {
  t.plan(1)
  const state = stated(states)
  state.to(state.actions.FROZEN, '75F')
  t.is(state.value, '75F',
    'value is correctly set to states value')
})

test('has allows an update to state w/ object', t => {
  t.plan(1)
  const state = stated(states)
  state.to(state.actions.BOILED, { state: 'gas' })
  t.deepEqual(state.value, { temp: '212F', state: 'gas' },
    'value is correctly set to states value')
})

test('return to initial state', t => {
  t.plan(1)
  const state = stated(states)
  state.to(state.actions.FROZEN)
  state.initial()
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

test('transition to new state using is', t => {
  t.plan(2)
  const state = stated(states)
  state.to(state.actions.FROZEN)
  t.is(state.state, 'ice',
    'transitioned to new state successfully')
  t.deepEqual(state.actions, { BOILED: 'BOILED', WARMED: 'WARMED' },
    'updated actions are correct')
})

test('is allows an update to state w/ primitive', t => {
  t.plan(1)
  const state = stated(states)
  state.to(state.actions.FROZEN, '32F')
  t.is(state.value, '32F',
    'value is correctly set to states value')
})

test('is allows an update to state w/ object', t => {
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
  state.on('transition', ({ state, actions, value }) => {
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
  t.is(state.__history[current].state, 'initial', '"initial" state is in history')
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

test('"undo" and "redo" are no-ops when history.lenght is 0', t => {
  t.plan(2)
  const state = stated(states)
  state.undo()
  t.is(state.state, 'initial', '"undo" will not go below 0')
  state.redo()
  t.is(state.state, 'initial', '"redo" will not exceed __history.lenght - 1')
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

test('"actions" does not include "value", "onLeave", "onEnter"', t => {
  t.plan(3)
  const state = stated(states)
  const actions = Object.keys(state.actions)
  t.truthy(!actions.includes('value'), '"actions" does not include "value"')
  t.truthy(!actions.includes('onEnter'), '"actions" does not include "onEnter"')
  t.truthy(!actions.includes('onLeave'), '"actions" does not include "onLeave"')
})

test('"onLeave" function is executed when exiting a state', t => {
  const state = stated({
    initial: {
      FROZEN: 'ice',
      value: '60F',
      onLeave: () => t.pass()
    },
    ice: {
      WARMED: 'initial',
      value: '32F'
    }
  }, true)
  state.to(state.actions.FROZEN)
})

test('"onEnter" function is executed when a state is entered', t => {
  const state = stated({
    initial: {
      FROZEN: 'ice',
      value: '60F'
    },
    ice: {
      WARMED: 'initial',
      value: '32F',
      onEnter: () => t.pass()
    }
  }, true)
  state.to(state.actions.FROZEN)
})
