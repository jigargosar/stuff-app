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
import * as PropTypes from 'prop-types'
import styled, { ThemeProvider } from 'styled-components'
import { space, width } from 'styled-system'
import { Box, Flex } from 'rebass'

console.debug(`system`, width, space)

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

// APP

const TopInput = styled.input`
  ${space}
`
TopInput.defaultProps = {
  p: 3,
}

TopInput.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  ...space.propTypes,
}

const FCol = styled(Flex)`
  flex-direction: column;
`

function App() {
  const [state, setState] = useState(loadAppState)
  const deepMergeState = partialState => setState(mergeDeepLeft(partialState))

  useEffect(() => cacheAppState(state))

  const [getInputValue, setInputValue, onInputSubmit] = [
    () => state.inputValue,
    inputValue => deepMergeState({ inputValue }),
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

        deepMergeState({
          inputValue: '',
          lookup: { [grain.id]: grain },
        })
      }
    },
  ]

  return (
    <ThemeProvider theme={{}}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <FCol as={'main'} className="items-center">
          <FCol p={3} width={'20em'}>
            <TopInput
              value={getInputValue()}
              onChange={ev => setInputValue(ev.target.value)}
              onKeyDown={hotKeys(['Enter', onInputSubmit])}
            />
            <Box className="pt3">
              {values(state.lookup).map(g => (
                <Box key={g.id} className="pv2 bb b--light-gray">
                  {g.title}
                </Box>
              ))}
            </Box>
          </FCol>
        </FCol>
      </div>
    </ThemeProvider>
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
