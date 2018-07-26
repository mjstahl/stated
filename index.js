'use strict'

class Transiton {
  constructor(states) {
    if (!states['initial']) throw `A valid 'initial' state must be provided`;
    this.states = states;
    this.state = 'initial';
  }

  has(action) {
    const transitionTo = this.states[this.state][action];
    if (!transitionTo) {
      throw `'${action}' does not exist as an action of '${this.state}'`;
    }
    if (typeof states[transitionTo] !== 'string') {
      throw `'${transitionTo}' is not a valid state. It must be a string.`
    }
    if (!states[transitionTo]) {
      throw `'${transitionTo}' does not exist`;
    }
    this.state = transitionTo;
  }

  get actions() {
    const actions = {};
    Object.keys(this.states)
      .filter(s => s !== 'value').forEach(a => actions[a] = a);
    return actions;
  }

  get value() {
    const value = this.states[this.state].value;
    return (typeof value === 'function') ? value() : value;
  }
}

module.exports = Transiton;