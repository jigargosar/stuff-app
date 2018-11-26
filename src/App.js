import React, { useEffect, useState } from 'react'
import './App.css'
import { produce } from 'immer'
import { AppThemeProvider, FCol } from './components/styled'
import {
  cacheAppState,
  mapGrains,
  onWindowKeydown,
  restoreAppState,
} from './state'
import GrainItem from './components/GrainItem'
import TopInput from './components/TopInput'

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
          <TopInput {...{ state, immerState }} />
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
