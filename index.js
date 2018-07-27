'use strict'

class Transiton {
  constructor(states) {
    if (!states['initial']) throw `A valid 'initial' state must be provided`;
    this.states = states;
    this.state = 'initial';
  }

  has(action, updateValue) {
    const transitionTo = this.states[this.state][action];
    if (!transitionTo) {
      throw `'${action}' does not exist as an action of '${this.state}'`;
    }
    if (typeof transitionTo !== 'string') {
      throw `'${transitionTo}' is not a valid state. It must be a string.`
    }
    if (!this.states[transitionTo]) {
      throw `'${transitionTo}' does not exist`;
    }
    this.state = transitionTo;
    if (updateValue) this.value = updateValue;
    return this;
  }

  get actions() {
    const actions = {};
    Object.keys(this.states[this.state])
      .filter(s => s !== 'value').forEach(a => actions[a] = a);
    return actions;
  }

  get value() {
    return this.states[this.state].value;
  }

  set value(update) {
    const value = this.states[this.state].value;
    if (update && (Object.getPrototypeOf(update) === Object.prototype)) {
      Object.assign(value, update);
    } else {
      this.states[this.state].value = update;
    }
  }
}

module.exports = Transiton;