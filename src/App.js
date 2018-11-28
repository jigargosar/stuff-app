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
  onWindowKeydown,
  restoreAppState,
  stateReducer,
} from './State'
import GrainItem from './components/GrainItem'
import TopInput from './components/TopInput'

const GrainList = React.memo(({ state, dispatch }) => (
  <FCol pt={3} className="">
    {mapGrains(
      ({ grain, isSelected, edit }) => (
        <GrainItem key={grain.id} {...{ grain, isSelected, edit, dispatch }} />
      ),
      state,
    )}
  </FCol>
))

function useWindowKeyDownEffect(effectFn, ...dependentInputArgs) {
  React.useEffect(() => {
    console.log('useWindowKeyDownEffect Triggered')
    const eventListener = R.partialRight(effectFn, dependentInputArgs)
    window.addEventListener('keydown', eventListener)
    return () => {
      window.removeEventListener('keydown', eventListener)
    }
  }, dependentInputArgs)
}

function App() {
  const [state, dispatch] = React.useReducer(stateReducer, restoreAppState())
  React.useEffect(() => cacheAppState(state))

  useWindowKeyDownEffect(onWindowKeydown, state, dispatch)

  return (
    <AppThemeProvider>
      <FCol p={3} width={'30em'}>
        <TopInput value={state.inputValue} dispatch={dispatch} />
        <GrainList state={state} dispatch={dispatch} />
      </FCol>
    </AppThemeProvider>
  )
}

export default App

// HELPERS
