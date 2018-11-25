import React, { useEffect, useState } from 'react'
import './App.css'
import * as R from 'ramda'
import {
  compose,
  defaultTo,
  find,
  identity,
  isNil,
  mergeDeepRight,
} from 'ramda'
import isHotkey from 'is-hotkey/src'
import nanoid from 'nanoid'
import * as PropTypes from 'prop-types'
import styled, { ThemeProvider } from 'styled-components'
import { Box, Flex } from 'rebass'
import * as invariant from 'invariant'
import { produce } from 'immer'

const styledComponentsTheme = { space: [0, 4, 8, 16, 32, 64, 128, 256, 512] }

// Basic Styled Components

export const FCol = styled(Flex)`
  flex-direction: column;
`

export const FColCX = styled(FCol)`
  align-items: center;
`

export const FRow = styled(Flex)`
  flex-direction: row;
`

export const FRowCY = styled(FRow)`
  align-items: center;
`

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

// APP Components

const TopInput = styled.input`
  padding: ${props => props.theme.space[3] + 'px'};
`
TopInput.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
}

// APP

// APP STORAGE

const appStateStorageKey = () => 'app-state'

export function cacheAppState(state) {
  storageSet(appStateStorageKey(), state)
}

export function restoreAppState() {
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

function createGrainWithTitle(title) {
  invariant(!isNil(title), `null arg title:${title}`)
  return {
    id: 'grain--' + nanoid(),
    ca: Date.now(),
    ma: Date.now(),
    title,
    desc: '',
    done: false,
  }
}

function setInputValue(iv, immerState) {
  immerState(state => {
    state.inputValue = iv
  })
}

function resetInputValue(immerState) {
  immerState(state => {
    state.inputValue = ''
  })
}

function insertGrain(grain, immerState) {
  immerState(state => {
    state.lookup[grain.id] = grain
  })
}

function deleteGrain(grain, immerState) {
  immerState(state => {
    delete state.lookup[grain.id]
  })
}

function grainSetDoneProp(bool, g, immerState) {
  immerState(state => {
    state.lookup[g.id].done = bool
  })
}

function getInputValue(state) {
  return state.inputValue
}

function onInputSubmit(immerState) {
  immerState(state => {
    const title = getInputValue(state).trim()
    if (title) {
      const grain = createGrainWithTitle(title)

      resetInputValue(immerState)
      insertGrain(grain, immerState)
    }
  })
}

function currentGrains(state) {
  return R.values(state.lookup())
}

function App() {
  const [state, setState] = useState(restoreAppState)
  const immerState = fn => setState(produce(fn))
  useEffect(() => cacheAppState(state))

  return (
    <ThemeProvider theme={styledComponentsTheme}>
      <FCol className="items-center">
        <FCol p={3} width={'30em'}>
          <TopInput
            value={getInputValue(state)}
            onChange={ev => setInputValue(ev.target.value, immerState)}
            onKeyDown={hotKeys(['Enter', () => onInputSubmit(immerState)])}
          />
          <Box pt={3} className="">
            {currentGrains(state).map(g => (
              <FRowCY key={g.id} py={2} className="bb b--light-gray">
                <Box p={2}>
                  <input
                    type="checkbox"
                    value={Boolean(g.done)}
                    onChange={ev =>
                      grainSetDoneProp(ev.target.checked, g, immerState)
                    }
                  />
                </Box>
                <Box className="flex-auto">{g.title}</Box>
                <button onClick={() => deleteGrain(g, immerState)}>X</button>
              </FRowCY>
            ))}
          </Box>
        </FCol>
      </FCol>
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
