import React, { useEffect, useState } from 'react'
import './App.css'
import { AppThemeProvider, FCol } from './components/styled'
import {
  cacheAppState,
  mapGrains,
  onWindowKeydown,
  restoreAppState,
} from './state'
import GrainItem from './components/GrainItem'
import TopInput from './components/TopInput'

// noinspection ES6UnusedImports
import * as R from 'ramda' // eslint-disable-line no-unused-vars

function App() {
  const [state, setState] = useState(restoreAppState)
  useEffect(() => cacheAppState(state))

  useEffect(() => {
    const listener = onWindowKeydown(state, setState)
    window.addEventListener('keydown', listener)
    return () => {
      window.removeEventListener('keydown', listener)
    }
  })

  return (
    <AppThemeProvider>
      <FCol className="items-center">
        <FCol p={3} width={'30em'}>
          <TopInput {...{ state, setState }} />
          <FCol pt={3} className="">
            {mapGrains(
              ({ grain, isSelected, edit }) => (
                <GrainItem
                  key={grain.id}
                  {...{ grain, isSelected, edit, setState }}
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
