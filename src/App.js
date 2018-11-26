import React, { useEffect, useState } from 'react'
import './App.css'
import { produce } from 'immer'
import InputText from './components/InputText'
import { AppThemeProvider, FCol } from './components/styled'
import { hotKeys } from './hotKeys'
import {
  cacheAppState,
  getGrainDomId,
  getInputValue,
  mapGrains,
  onTopInputSubmit,
  onWindowKeydown,
  restoreAppState,
  setInputValue,
} from './state'
import GrainEditItem from './components/GrainEditItem'
import GrainDisplayItem from './components/GrainDisplayItem'
import GrainItem from './components/GrainItem'

// APP STORAGE

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
