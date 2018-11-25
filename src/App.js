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
import debounce from 'lodash.debounce'

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

// InputComponents

export function CheckBox({ value, onChange }) {
  return (
    <input
      type="checkbox"
      value={value}
      onChange={ev => onChange(ev.target.checked, ev)}
    />
  )
}

CheckBox.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.bool.isRequired,
}

export function InputText({ value, onChange, ...otherProps }) {
  return (
    <input
      type="text"
      value={value}
      onChange={ev => onChange(ev.target.value, ev)}
      {...otherProps}
    />
  )
}

InputText.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
}

// APP Components

const TopInput = styled(InputText)`
  padding: ${props => props.theme.space[3] + 'px'};
`
TopInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
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

function onTopInputSubmit(immerState) {
  immerState(state => {
    const title = getInputValue(state).trim()
    if (title) {
      const grain = createGrainWithTitle(title)

      resetInputValue(immerState)
      insertGrain(grain, immerState)
      setSidxToGrain(grain, immerState)
      debounceFocusId(grainDomId(grain))
    }
  })
}
function setSidxToGrain(grain, immerState) {
  immerState(state => {
    state.sidx = currentGrains(state).findIndex(g => g.id === grain.id)
  })
}

function currentGrains(state) {
  return R.values(state.lookup)
}

const pd = ev => {
  ev.preventDefault()
}

const wrapPD = fn =>
  compose(
    fn,
    R.tap(pd),
  )

function grainDomId(grain) {
  return 'grain-li--' + grain.id
}

function focusId(domId) {
  try {
    document.getElementById(domId).focus()
  } catch (e) {
    console.error('Focus Failed:', domId)
  }
}

const debounceFocusId = debounce(focusId)

function rollSelectionBy(offset, shouldFocus, immerState) {
  return immerState(state => {
    const grains = currentGrains(state)
    const grainsLength = grains.length
    if (grainsLength > 1) {
      const clampedSidx = R.clamp(0, grains.length - 1, state.sidx)
      state.sidx = R.mathMod(clampedSidx + offset, grainsLength)
      debounceFocusId(grainDomId(grains[state.sidx]))
    }
  })
}

function onWindowKeydown(state, immerState) {
  return ev => {
    const tagName = ev.target.tagName
    console.debug(ev, tagName)
    if (tagName === 'INPUT' || tagName === 'BODY') {
      hotKeys(
        ['ArrowUp', wrapPD(() => console.debug('ev tapped', ev))],
        ['ArrowDown', pd],
      )(ev)
    } else {
    }

    hotKeys(
      ['ArrowUp', () => rollSelectionBy(-1, true, immerState)],
      ['ArrowDown', () => rollSelectionBy(1, true, immerState)],
    )(ev)
  }
}

function mapOverGrainsWithSelection(fn, state) {
  const grains = currentGrains(state)
  if (grains.length > 0) {
    const sidx = R.clamp(0, grains.length - 1, state.sidx)
    return grains.map((grain, idx) =>
      fn({ grain, isSelected: sidx === idx, edit: state.edit }),
    )
  } else {
    return []
  }
}

function getMaybeGrainAtSidx(state) {
  const grains = currentGrains(state)
  const grainsLength = grains.length
  if (grainsLength > 0) {
    const clampedSidx = R.clamp(0, grains.length - 1, state.sidx)
    return grains[clampedSidx]
  }
}

function startEditingSelectedGrain(immerState) {
  return immerState(state => {
    const edit = state.edit
    if (edit) {
      console.warn('Handle start editing when already in edit mode')
    } else {
      const grain = getMaybeGrainAtSidx(state)
      if (grain) {
        state.edit = { grainId: grain.id, title: grain.title }
      }
    }
  })
}

function renderGrainItem(immerState) {
  return ({ grain, isSelected, edit }) => {
    if (edit) {
      return (
        <FRowCY
          id={grainDomId(grain)}
          tabIndex={isSelected ? 0 : -1}
          key={grain.id}
          py={2}
          className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
          onKeyDown={hotKeys([
            'Enter',
            ev => {
              if (ev.target.id === grainDomId(grain)) {
                startEditingSelectedGrain(immerState)
              }
            },
          ])}
        >
          <Box p={2}>
            <CheckBox
              value={grain.done}
              onChange={bool => grainSetDoneProp(bool, grain, immerState)}
            />
          </Box>
          <Box className="flex-auto">{grain.title}</Box>
          <button onClick={() => deleteGrain(grain, immerState)}>X</button>
        </FRowCY>
      )
    } else {
      return (
        <FRowCY
          id={grainDomId(grain)}
          tabIndex={isSelected ? 0 : -1}
          key={grain.id}
          py={2}
          className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
          onKeyDown={hotKeys([
            'Enter',
            ev => {
              if (ev.target.id === grainDomId(grain)) {
                startEditingSelectedGrain(immerState)
              }
            },
          ])}
        >
          <Box p={2}>
            <CheckBox
              value={grain.done}
              onChange={bool => grainSetDoneProp(bool, grain, immerState)}
            />
          </Box>
          <Box className="flex-auto">{grain.title}</Box>
          <button onClick={() => deleteGrain(grain, immerState)}>X</button>
        </FRowCY>
      )
    }
  }
}

function renderTopInput(state, immerState) {
  return (
    <TopInput
      value={getInputValue(state)}
      onChange={iv => setInputValue(iv, immerState)}
      onKeyDown={hotKeys(['Enter', () => onTopInputSubmit(immerState)])}
    />
  )
}

function App() {
  const [state, setState] = useState(restoreAppState)
  const immerState = fn => setState(produce(fn))
  useEffect(() => cacheAppState(state))

  useEffect(() => {
    const listener = onWindowKeydown(state, immerState)
    window.addEventListener('keydown', listener)
    return () => {
      window.removeEventListener('keydown', listener)
    }
  })

  return (
    <ThemeProvider theme={styledComponentsTheme}>
      <FCol className="items-center">
        <FCol p={3} width={'30em'}>
          {renderTopInput(state, immerState)}
          <Box pt={3} className="">
            {mapOverGrainsWithSelection(renderGrainItem(immerState), state)}
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
