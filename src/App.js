import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import Grain from './components/Grain'
import { isNil } from 'ramda'

class App extends Component {
  render() {
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
            {grains.map((grain, idx) => (
              <Grain key={idx} title={grain.title} />
            ))}
          </section>
        </main>
      </div>
    )
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
