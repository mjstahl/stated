const Emitter = require('nanoevents')

class Stated {
  constructor (states, persistent = false) {
    this.__emitter = new Emitter()
    this.__states = states

    const initial = states['initial']
    if (!initial && states[initial]) {
      throw new Error(`A valid 'initial' state must be provided`)
    }

    this.__history = []
    this.persistent = persistent

    this.__transition(initial, undefined, false)
  }

  get actions () {
    const notActions = ['canEnter', 'canLeave', 'onEnter', 'onLeave', 'value']
    const actions = {}
    Object.keys(this.__states[this.state])
      .filter(s => !notActions.includes(s))
      .forEach(a => { actions[a] = a })
    return actions
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

  on () {
    return this.__emitter.on.apply(this.__emitter, arguments)
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
    const transitionTo = this.__states[this.state][action]
    if (!transitionTo) {
      throw new Error(`'${action}' does not exist as an action of '${this.state}'`)
    }
    if (typeof transitionTo !== 'string') {
      throw new Error(`'${transitionTo}' is not a valid state. It must be a string.`)
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

    const canEnter = this.__states[state].canEnter
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
