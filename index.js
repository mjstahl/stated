'use strict'

const events = require('events')

class Stated extends events.EventEmitter {
  constructor (states) {
    super()
    if (!states['initial']) {
      throw new Error(`A valid 'initial' state must be provided`)
    }
    this.states = states
    this.state = 'initial'
  }

  get actions () {
    const actions = {}
    Object.keys(this.states[this.state])
      .filter(s => s !== 'value')
      .forEach(a => { actions[a] = a })
    return actions
  }

  get value () {
    return this.states[this.state].value
  }

  set value (update) {
    const value = this.states[this.state].value
    if (update && (Object.getPrototypeOf(update) === Object.prototype)) {
      Object.assign(value, update)
    } else {
      this.states[this.state].value = update
    }
  }

  change (state, updateValue) {
    this.state = state
    if (updateValue) this.value = updateValue

    this.emit('transition', this)
  }

  has (action, updateValue) {
    const transitionTo = this.states[this.state][action]
    if (!transitionTo) {
      throw new Error(`'${action}' does not exist as an action of '${this.state}'`)
    }
    if (typeof transitionTo !== 'string') {
      throw new Error(`'${transitionTo}' is not a valid state. It must be a string.`)
    }
    if (!this.states[transitionTo]) {
      throw new Error(`'${transitionTo}' does not exist`)
    }
    this.change(transitionTo, updateValue)
    return this
  }

  initial () {
    this.change('initial')
    return this
  }

  is () {
    return this.has.apply(this, arguments)
  }

  to () {
    return this.has.apply(this, arguments)
  }
}

exports = module.exports = (states) => new Stated(states)
exports.Stated = Stated
