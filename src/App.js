import React, { useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import {
  compose,
  defaultTo,
  find,
  identity,
  isNil,
  mergeDeepLeft,
  mergeDeepRight,
  values,
} from 'ramda'
import isHotkey from 'is-hotkey/src'
import nanoid from 'nanoid'

// HOTKEY HELPERS

function hotKeys(...mappings) {
  return function(ev) {
    return compose(
      ([keys, handler]) => handler(ev),
      defaultTo([null, identity]),
      find(([keys]) => isHotkey(keys, ev)),
    )(mappings)
  }
}

// APP STORAGE

const appStateStorageKey = () => 'app-state'

export function loadAppState() {
  const defaultState = {
    inputValue: '',
    lookup: {},
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
  const [state, setState] = useState(loadAppState)
  const [count, setCount] = useState(0)

  useEffect(() => cacheAppState(state))

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <main className="flex flex-column items-center">
        <div className="measure-narrow w-100">
          <p>HelloWorld</p>
          <input
            value={state.inputValue}
            onChange={ev =>
              setState(mergeDeepLeft({ inputValue: ev.target.value }))
            }
            onKeyDown={hotKeys([
              'Enter',
              () => {
                const title = state.inputValue.trim()
                if (title) {
                  const grain = {
                    id: 'grain--' + nanoid(),
                    ca: Date.now(),
                    ma: Date.now(),
                    title,
                    desc: '',
                  }
                  setState(
                    mergeDeepLeft({
                      inputValue: '',
                      lookup: { [grain.id]: grain },
                    }),
                  )
                }
              },
            ])}
          />
          <div className="">
            {values(state.lookup).map(g => (
              <div className="pv2 bb b--light-gray">{g.title}</div>
            ))}
          </div>
          <Example count={count} setCount={setCount} />
        </div>
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
