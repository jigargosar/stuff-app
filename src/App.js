import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import {
  addIndex,
  ascend,
  assoc,
  clamp,
  compose,
  curry,
  descend,
  fromPairs,
  isNil,
  map,
  mergeDeepRight,
  mergeLeft,
  prop,
  sortWith,
  values,
} from 'ramda'
import isHotKey from 'is-hotkey'
import nanoid from 'nanoid'
import cn from 'classname'
import PropTypes from 'prop-types'

// Grain

function Grain({ isSelected, onFocus, sortIdx, title }) {
  return (
    <div
      onFocus={onFocus}
      tabIndex={isSelected ? 0 : -1}
      className={cn('Grain', { 'Grain-root-selected': isSelected })}
    >
      <small>{sortIdx}</small>
      {' : '}
      <span>{title}</span>
    </div>
  )
}

Grain.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  onFocus: PropTypes.func.isRequired,
  sortIdx: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
}

const sortGrains = sortWith([ascend(prop('idx')), descend(prop('ca'))])

// APP STORAGE

const appStateStorageKey = () => 'app-state'

function loadAppState() {
  const defaultState = {
    grainTitleInput: '',
    grainsLookup: {},
    sidx: -1,
  }

  return compose(mergeDeepRight(defaultState))(
    storageGetOr({}, appStateStorageKey()),
  )
}

function cacheAppState(state) {
  storageSet(appStateStorageKey(), state)
}

// APP

class App extends Component {
  state = loadAppState()

  get sortedGrains() {
    return compose(
      sortGrains,
      values,
    )(this.state.grainsLookup)
  }

  get currentSidx() {
    const grainsLength = this.sortedGrains.length

    return grainsLength > 0 ? clamp(0, grainsLength - 1, this.state.sidx) : -1
  }

  render() {
    const renderGrain = curry((sidx, g, idx) => (
      <Grain
        key={g.id}
        sortIdx={g.idx}
        isSelected={idx === sidx}
        title={g.title}
        onFocus={() => this.onGrainFocus(idx)}
      />
    ))
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
            <div className="Grains-list">
              {this.sortedGrains.map(renderGrain(this.currentSidx))}
            </div>
          </section>
        </main>
      </div>
    )
  }

  onGrainInputChange = e => {
    this.setState({ grainTitleInput: e.target.value }, this.cacheState)
  }

  cacheState = () => {
    cacheAppState(this.state)
  }

  onGrainInputKeyDown = e => {
    if (isHotKey('Enter', e)) {
      this.addNewGrain()
    }
  }

  addNewGrain() {
    this.setState(
      {
        grainsLookup: addNewGrainWithTitle(
          this.state.grainTitleInput,
          this.state.grainsLookup,
        ),
        grainTitleInput: '',
      },
      this.cacheState,
    )
  }
  onGrainFocus = sidx => {
    this.setState({ sidx }, this.cacheState)
  }
}

export default App

function addNewGrainWithTitle(title_, lookup) {
  const title = title_.trim()
  if (title) {
    const grain = newGrainWithTitle(title)
    const sortLookup = compose(
      fromPairs,
      addIndex(map)((g, idx) => [g.id, mergeLeft({ idx }, g)]),
      sortGrains,
      values,
    )
    return compose(
      sortLookup,
      assoc(grain.id)(grain),
    )(lookup)
  } else {
    return lookup
  }
}

function newGrainWithTitle(title) {
  return {
    id: 'gid--' + nanoid(),
    title,
    desc: '',
    idx: 0,
    ca: Date.now(),
    ma: Date.now(),
  }
}

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
