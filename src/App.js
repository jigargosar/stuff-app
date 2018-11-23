import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import Grain from './components/Grain'
import {
  assoc,
  compose,
  curry,
  isNil,
  mapObjIndexed,
  mergeDeepRight,
  values,
} from 'ramda'
import isHotKey from 'is-hotkey'
import nanoid from 'nanoid'

const appStateStorageKey = () => 'app-state'

const mergeDefaultAppState = mergeDeepRight({
  grainTitleInput: '',
  grainsLookup: {},
})

class App extends Component {
  state = mergeDefaultAppState(storageGetOr({}, appStateStorageKey()))

  render() {
    const renderGrain = (grain, id) => <Grain key={id} title={grain.title} />
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <main>
          <section>
            <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </section>
          <section>
            <p>Grain:</p>
            <input
              className="Grain-title-input"
              type="text"
              autoFocus
              value={this.state.grainTitleInput}
              onChange={this.onGrainInputChange}
              onKeyDown={this.onGrainInputKeyDown}
            />
            {objToList(renderGrain)(this.state.grainsLookup)}
          </section>
        </main>
      </div>
    )
  }

  onGrainInputChange = e => {
    this.setState({ grainTitleInput: e.target.value }, this.cacheState)
  }

  cacheState = () => {
    storageSet(appStateStorageKey(), this.state)
  }

  onGrainInputKeyDown = e => {
    if (isHotKey('Enter', e)) {
      this.addNewGrain()
    }
  }

  addNewGrain() {
    const title = this.state.grainTitleInput.trim()
    if (title) {
      const grain = newGrainWithTitle(title)
      this.setState(
        {
          grainsLookup: assoc(grain.id)(grain)(this.state.grainsLookup),
          grainTitleInput: '',
        },
        this.cacheState,
      )
    }
  }
}

export default App

function newGrainWithTitle(title) {
  return {
    id: 'gid--' + nanoid(),
    title,
    ca: Date.now(),
    ma: Date.now(),
  }
}

// HELPERS

export const objToList = curry((fn, obj) =>
  compose(
    values,
    mapObjIndexed(fn),
  )(obj),
)

export function storageGetOr(defaultValue, key) {
  try {
    let item = localStorage.getItem(key)
    if (isNil(item)) return defaultValue
    return JSON.parse(item)
  } catch (e) {
    return defaultValue
  }
}

export function storageSet(key, value) {
  if (isNil(value) || isNil(key)) {
    console.warn('Invalid Args', 'storageSet', key, value)
    return
  }
  localStorage.setItem(key, JSON.stringify(value))
}
