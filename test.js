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
    WARMED: 'water',
    value: '32F'
  },
  steam: {
    COOLED: 'water',
    FROZEN: 'ice',
    value() { return '212F' }
  }
};

test('newly created instance', t => {
  const state = new Transiton(states);

  t.truthy(state, 'Transiton created successfully');
  t.is(state.state, 'initial', 'initial state is correct');
  t.is(state.value, '60F', 'value is correctly set to states value');
});