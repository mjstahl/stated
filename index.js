const Emitter = require('nanoevents')
const autobind = require('./bind')

const NOT_ACTIONS = [
  'canEnter', 'canLeave', 'initial', 'onEnter', 'onLeave', 'value'
]

class Stated {
  constructor (states, persistent = false) {
    autobind(this)

    this.__emitter = new Emitter()
    this.__states = states

    this.__history = []
    this.persistent = persistent

    const initial = states['initial']
    if (initial) {
      this.__transition(initial, undefined, false)
    }
  }

  get actions () {
    return this.__possibleTransitions()
      .reduce((actions, p) => Object.assign(actions, { [p]: p }), {})
  }

  set initial (initial) {
    this.__transition(initial)
  }

  get value () {
    return this.__states[this.state].value
  }

  set value (update) {
    const value = this.__states[this.state].value
    if (update && (Object.getPrototypeOf(update) === Object.prototype)) {
      Object.assign(value, update)
    } else {
      this.__states[this.state].value = update
    }
  }

  get via () {
    const state = this.__states[this.state]
    return this.__possibleTransitions()
      .reduce((actions, p) => Object.assign(actions, { [p]: state[p] }), {})
  }

  onTransition (callback) {
    return this.__emitter.on('transition', callback)
  }

  redo () {
    if (!this.persistent) {
      return this
    }
    if (this.__current === this.__history.length - 1) {
      return this
    }
    this.__current = this.__current + 1
    this.__changeHistory()
  }

  reset () {
    this.__transition(this.__states['initial'], undefined, false)
    return this
  }

  to (action, updateValue) {
    const state = this.__states[this.state]
    const transitionTo = (state && state[action]) ? state[action] : action
    if (!transitionTo) {
      throw new Error(`'${action}' does not exist as an action of '${this.state}'`)
    }
    if (!this.__states[transitionTo]) {
      throw new Error(`'${transitionTo}' does not exist`)
    }
    this.__transition(transitionTo, updateValue)
    return this
  }

  undo () {
    if (!this.persistent || this.__current === 0) {
      return this
    }
    this.__current = this.__current - 1
    this.__changeHistory()
  }

  __possibleTransitions () {
    let possible = this.state && Object.keys(this.__states[this.state])
      .filter(p => !NOT_ACTIONS.includes(p))
    if (!possible || possible.length === 0) {
      possible = Object.keys(this.__states)
        .filter(p => !NOT_ACTIONS.includes(p))
    }
    return possible
  }

  __recordHistory () {
    this.__history.push({ state: this.state, value: this.value })
    this.__current = this.__history.length - 1
  }

  __changeHistory () {
    const { state, value } = this.__history[this.__current]
    this.__transition(state, value, true, false)
  }

  __transition (state, updateValue, guard = true, record = true) {
    const canLeave = this.state && this.__states[this.state].canLeave
    if (guard && canLeave && !canLeave(this)) {
      return this
    }

    const canEnter = this.state && this.__states[state].canEnter
    if (guard && canEnter && !canEnter(this)) {
      return this
    }

    if (this.state) {
      const onLeave = this.__states[this.state].onLeave
      if (onLeave) onLeave(this)
    }

    this.state = state
    if (updateValue) { this.value = updateValue }
    if (this.persistent && record) { this.__recordHistory() }
    this.__emitter.emit('transition', this)

    const onEnter = this.__states[state].onEnter
    if (onEnter) onEnter(this)
  }
}

exports = module.exports = (states, persistent) => new Stated(states, persistent)
exports.Stated = Stated
