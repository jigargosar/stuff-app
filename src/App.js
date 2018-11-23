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
  identity,
  isNil,
  map,
  mathMod,
  mergeDeepRight,
  mergeLeft,
  prop,
  sortWith,
  tap,
  values,
} from 'ramda'
import isHotKey from 'is-hotkey'
import nanoid from 'nanoid'
import cn from 'classname'

const sortGrains = sortWith([ascend(prop('idx')), descend(prop('ca'))])

// APP STORAGE

const appStateStorageKey = () => 'app-state'

function loadAppState() {
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

function cacheAppState(state) {
  storageSet(appStateStorageKey(), state)
}

// GRAIN MODEL

function getGrainListItemDomId(grain) {
  return 'grain-list-item--' + grain.id
}
function maybeNewGrainWithTitle(title_) {
  const title = title_.trim()
  return title ? newGrainWithTitle(title) : null
}
function insertNewGrain(grain, lookup) {
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
}

function setGrainTitle(title_, grainId, lookup) {
  const title = title_.trim()
  const grain = lookup[grainId]
  if (title && grain && grain.title !== title) {
    const sortLookup = compose(
      fromPairs,
      addIndex(map)((g, idx) => [g.id, mergeLeft(g, { idx })]),
      sortGrains,
      values,
    )
    const updatedGrain = mergeLeft({ title }, grain)
    return compose(
      sortLookup,
      tap(console.log),
      assoc(grain.id)(updatedGrain),
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

// APP
class App extends Component {
  state = loadAppState()

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKeyDown)
  }

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

  renderGrain = curry((sidx, g, idx) => {
    const isSelected = idx === sidx

    const edit = this.state.edit
    if (edit && edit.grainId === g.id) {
      return (
        <input
          key={g.id}
          id={getGrainListItemDomId(g)}
          // className={cn('Grain', { 'Grain-root-selected': isSelected })}
          className="Grain Grain--inline-edit-input"
          value={edit.title}
          onChange={e =>
            this.setState(
              {
                edit: mergeLeft({ title: e.target.value }, this.state.edit),
              },
              this.cacheState,
            )
          }
          // tabIndex={isSelected ? 0 : -1}
          onFocus={() => this.onGrainFocusedAtIdx(idx)}
          onKeyDown={this.onGrainEditKeyDown}
        />
      )
    } else {
      return (
        <div
          key={g.id}
          id={getGrainListItemDomId(g)}
          className={cn('Grain')}
          tabIndex={isSelected ? 0 : -1}
          onFocus={() => this.onGrainFocusedAtIdx(idx)}
          onKeyDown={e => this.onGrainKeyDown(g, e)}
        >
          <small>{g.idx}</small>
          {' : '}
          <span>{g.title}</span>
        </div>
      )
    }
  })

  render() {
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
            <p>Grains:</p>
            <input
              className="Grain-title-input"
              type="text"
              autoFocus
              value={this.state.grainTitleInput}
              onChange={this.onGrainInputChange}
              onKeyDown={this.onGrainInputKeyDown}
            />
            <div className="Grains-list">
              {this.sortedGrains.map(this.renderGrain(this.currentSidx))}
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
    const grain = maybeNewGrainWithTitle(this.state.grainTitleInput)
    this.setStateAndCache(
      {
        grainsLookup: insertNewGrain(grain, this.state.grainsLookup),
        grainTitleInput: '',
      },
      this.focusGrain(grain),
    )
  }

  onGrainFocusedAtIdx = sidx => {
    this.setState({ sidx }, this.cacheState)
  }

  onWindowKeyDown = e => {
    if (this.sortedGrains.length > 1) {
      if (isHotKey('ArrowDown', e)) {
        e.preventDefault()
        this.rollSidxByAndFocus(1)
      } else if (isHotKey('ArrowUp', e)) {
        e.preventDefault()
        this.rollSidxByAndFocus(-1)
      }
    }
  }

  rollSidxByAndFocus = offset => {
    const grainsLength = this.sortedGrains.length
    if (grainsLength > 1) {
      const sidx = mathMod(this.currentSidx + offset, grainsLength)
      this.setState(
        { sidx },
        compose(
          this.focusSidx,
          this.cacheState,
        ),
      )
    }
  }

  setStateAndCache = (state, fn = identity) => {
    this.setState(state, () => {
      fn()
      this.cacheState()
    })
  }

  focusSidx = () => {
    const grainAtSidx = this.sortedGrains[this.currentSidx]
    if (grainAtSidx) {
      const el = document.getElementById(getGrainListItemDomId(grainAtSidx))
      if (el) {
        el.focus()
        return
      }
    }
    console.error('focusSidx failed')
  }

  focusGrain = grain => {
    const el = document.getElementById(getGrainListItemDomId(grain))
    if (el) {
      el.focus()
      return
    }
    console.error('focusSidx failed')
  }

  onGrainKeyDown = (grain, e) => {
    if (isHotKey('Enter', e)) {
      this.setStateAndCache(
        {
          edit: { grainId: grain.id, title: grain.title },
        },
        this.focusSidx,
      )
    }
  }
  onGrainEditKeyDown = e => {
    if (isHotKey('Enter', e)) {
      const edit = this.state.edit
      this.setStateAndCache(
        {
          edit: null,
          grainsLookup: setGrainTitle(
            edit.title,
            edit.grainId,
            this.state.grainsLookup,
          ),
        },
        this.focusSidx,
      )
    }
  }
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
