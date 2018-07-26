const test = require('ava');
const Transiton = require('./index');

const states = {
  'water': {
    'FROZEN': 'ice',
    'BOILED': 'steam',
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
}

test('newly created instance', t => {
  const state = new Transiton('water', states);

  t.truthy(state, 'Transiton created successfully');
  t.is(state.value, '60F', 'value is correctly set to states value');
});