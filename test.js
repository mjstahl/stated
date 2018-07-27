const test = require('ava');
const Transiton = require('./index');

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
};

test('newly created instance', t => {
  t.plan(4);
  const state = new Transiton(states);
  t.truthy(state, 'Transiton created successfully');
  t.is(state.state, 'initial',
    'initial state is correct');
  t.is(state.value, '60F',
    'value is correctly set to states value');
  t.deepEqual(state.actions, { FROZEN: 'FROZEN', BOILED: 'BOILED' },
    'initial actions are correct');
});

test('transition to new state', t => {
  t.plan(3);
  const state = new Transiton(states);
  state.has(state.actions.FROZEN);
  t.is(state.state, 'ice',
    'transitioned to new state successfully');
  t.is(state.value, '32F',
    'value is correctly set to states value');
  t.deepEqual(state.actions, { BOILED: 'BOILED', WARMED: 'WARMED' },
    'updated actions are correct');
});

test('has allows an update to state w/ primitive', t => {
  t.plan(1);
  const state = new Transiton(states);
  state.has(state.actions.FROZEN, '75F');
  t.is(state.value, '75F',
    'value is correctly set to states value');
});

test('has allows an update to state w/ object', t => {
  t.plan(1);
  const state = new Transiton(states);
  state.has(state.actions.BOILED, { state: 'gas' });
  t.deepEqual(state.value, { temp: '212F', state: 'gas' },
    'value is correctly set to states value');
});