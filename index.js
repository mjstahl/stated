const autoBind = require('auto-bind')
const Emitter = require('nanoevents')

class Stated {
  constructor (states, persistent = false) {
    autoBind(this)

    this.emitter = new Emitter()

    if (!states['initial']) {
      throw new Error(`A valid 'initial' state must be provided`)
    }
    this.__states = states

    this.__history = []
    this.persistent = persistent

    this.__transition('initial')
  }

  get actions () {
    const actions = {}
    const notActions = ['onEnter', 'onLeave', 'value']
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

  initial () {
    this.__transition('initial')
    return this
  }

  on () {
    return this.emitter.on.apply(this.emitter, arguments)
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
    this.__transition(state, value, false)
  }

  __transition (state, updateValue, record = true) {
    if (this.__history.length !== 0) {
      const onLeave = this.__states[this.state].onLeave
      if (onLeave) onLeave()
    }

    this.state = state
    if (updateValue) { this.value = updateValue }
    if (this.persistent && record) { this.__recordHistory() }
    this.emitter.emit('transition', this)

    const onEnter = this.__states[state].onEnter
    if (onEnter) onEnter()
  }
}

exports = module.exports = (states, persistent) => new Stated(states, persistent)
exports.Stated = Stated
