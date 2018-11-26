import React, { useEffect, useState } from 'react'
import './App.css'
import { compose, isNil, mergeDeepRight } from 'ramda'
import { Box } from 'rebass'
import { produce } from 'immer'
import InputText from './components/InputText'
import CheckBox from './components/CheckBox'
import { AppThemeProvider, FCol, FRowCY } from './components/styled'
import { hotKeys } from './hotKeys'
import {
  deleteGrain,
  getGrainDomId,
  getInputValue,
  grainSetDoneProp,
  mapGrains,
  onTopInputSubmit,
  onWindowKeydown,
  setInputValue,
  startEditingSelectedGrain,
} from './state'
import GrainEditItem from './components/GrainEditItem'

// Basic Styled Components

// HOTKEY HELPERS

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

function GrainItem({ grain, isSelected, edit, immerState }) {
  const grainDomId = getGrainDomId(grain)
  const commonProps = {
    id: grainDomId,
    tabIndex: isSelected ? 0 : null,
    key: grain.id,
  }
  if (edit && edit.grainId === grain.id) {
    const title = edit.title
    return (
      <GrainEditItem
        {...commonProps}
        // className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
        title={title}
        grain={grain}
        immerState={immerState}
      />
    )
  } else {
    return (
      <FRowCY
        {...commonProps}
        py={2}
        className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
        onKeyDown={hotKeys([
          'Enter',
          ev => {
            if (ev.target.id === grainDomId) {
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

function renderTopInput(state, immerState) {
  return (
    <InputText
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
    <AppThemeProvider>
      <FCol className="items-center">
        <FCol p={3} width={'30em'}>
          {renderTopInput(state, immerState)}
          <FCol pt={3} className="">
            {mapGrains(
              ({ grain, isSelected, edit }) => (
                <GrainItem
                  key={grain.id}
                  {...{ immerState, grain, isSelected, edit }}
                />
              ),
              state,
            )}
          </FCol>
        </FCol>
      </FCol>
    </AppThemeProvider>
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
