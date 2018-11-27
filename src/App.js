// noinspection ES6UnusedImports
import PropTypes from 'prop-types' // eslint-disable-line no-unused-vars
// noinspection ES6UnusedImports
import * as R from 'ramda' // eslint-disable-line no-unused-vars
import React from 'react'
import './App.css'
import { AppThemeProvider, FCol } from './components/styled'
import {
  cacheAppState,
  mapGrains,
  onTopInputSubmit,
  onWindowKeydown,
  restoreAppState,
} from './State'
import GrainItem from './components/GrainItem'
import TopInput from './components/TopInput'

function GrainList({ state, setState }) {
  return mapGrains(
    ({ grain, isSelected, edit }) => (
      <GrainItem key={grain.id} {...{ grain, isSelected, edit, setState }} />
    ),
    state,
  )
}

function useAppState() {
  const [state, setState] = React.useState(restoreAppState)
  React.useEffect(() => cacheAppState(state))
  return [state, setState]
}

function App() {
  const [state, setState] = useAppState()

  React.useEffect(() => {
    const listener = onWindowKeydown(state, setState)
    window.addEventListener('keydown', listener)
    const disposer = () => {
      window.removeEventListener('keydown', listener)
    }
    return disposer
  })

  return (
    <AppThemeProvider>
      <FCol className="items-center">
        <FCol p={3} width={'30em'}>
          <TopInput
            onSubmit={inputState => setState(onTopInputSubmit(inputState))}
          />
          <FCol pt={3} className="">
            <GrainList state={state} setState={setState} />
          </FCol>
        </FCol>
      </FCol>
    </AppThemeProvider>
  )
}

export default App

// HELPERS
