import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import Grain from './components/Grain'
import { compose, isNil, mapObjIndexed, mergeDeepRight, values } from 'ramda'

const appStateStorageKey = () => 'app-state'

class App extends Component {
  state = mergeDeepRight({ grainTitleInput: '', grainsLookup: {} })(
    storageGetOr({}, appStateStorageKey()),
  )

  render() {
    console.log(this.state)
    const grains = [{ title: 'I am a grain' }, { title: 'Another grain ;)' }]
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
              value={this.state.grainTitleInput}
              onChange={this.onGrainInputChange}
              onKeyDown={this.onGrainInputKeyDown}
            />
            {compose(
              values,
              mapObjIndexed((grain, id) => (
                <Grain key={id} title={grain.title} />
              )),
            )(this.state.grainsLookup)}
          </section>
        </main>
      </div>
    )
  }

  onGrainInputChange = e => {
    this.setState({ grainTitleInput: e.target.value }, () => this.cacheState())
  }

  cacheState = () => {
    storageSet(appStateStorageKey(), this.state)
  }

  onGrainInputKeyDown = e => {
    switch (e.key) {
      case 'Enter':
        break

      default:
        break
    }
  }
}

export default App

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
