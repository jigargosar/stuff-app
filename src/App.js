import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { compose, isNil, mergeDeepRight } from 'ramda'

// APP STORAGE

const appStateStorageKey = () => 'app-state'

export function loadAppState() {
  const defaultState = {
    grainTitleInput: '',
    grainsLookup: {},
    sidx: -1,
    edit: null,
  }

  return compose(mergeDeepRight(defaultState))(
    storageGetOr({}, appStateStorageKey()),
  )
}

export function cacheAppState(state) {
  storageSet(appStateStorageKey(), state)
}

function Example({ count, setCount }) {
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(ct => ct + 1)}>Click me</button>
    </div>
  )
}

// APP

function App() {
  // const [state, setState] = useState(() => {
  //   console.log('App use state Called')
  //   return loadAppState()
  // })

  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <main>
        <p>HelloWorld</p>
        <Example count={count} setCount={setCount} />
      </main>
    </div>
  )
}

export default App

// HELPERS

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
