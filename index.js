module.exports = function transiton(initial, states) {
  if (arguments.length === 1) {
    states = initial;
    initial = undefined;
  }
  var state = initial || 'start';
  if (!states[state]) {
    throw 'An initial state of \'' + state + '\' must be provided.';
  }

  var actions = {};
  Object.keys(states[state]).filter(function(s) {
    return s !== 'value';
  }).forEach(function(a) {
    actions[a] = a;
  });

  var transiton = {
    actions: actions,
    state: state,
    has: function has(action) {
      if (!state[action]) {
        throw '\'' + action + '\' does not exist as an action of \''
          + state + '\'';
      }
      // TODO - finish up this refactoring
    }
  };

  return transiton;
};