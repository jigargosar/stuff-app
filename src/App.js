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
  rollSelectionBy,
} from './State'
import GrainItem from './components/GrainItem'
import InputText from './components/InputText'

function GrainList({ state, dispatch }) {
  return mapGrains(
    ({ grain, isSelected, edit }) => (
      <GrainItem key={grain.id} {...{ grain, isSelected, edit, dispatch }} />
    ),
    state,
  )
}

function appReducer(state, action) {
  switch (action.type) {
    case 'reset':
      return restoreAppState()
    case 'TopInputChanged':
      return { ...state, inputValue: action.inputValue }
    case 'TopInputSubmit':
      return onTopInputSubmit(state)

    case 'RollSelectionBy':
      return rollSelectionBy(action.offset, state)

    default:
      // A reducer must always return a valid state.
      // Alternatively you can throw an error if an invalid action is dispatched.
      console.error('Invalid Action', action, state)
      return state
  }
}

function App() {
  const [state, dispatch] = React.useReducer(appReducer, restoreAppState())
  React.useEffect(() => cacheAppState(state))

  const listener = onWindowKeydown(state, dispatch)

  React.useEffect(() => {
    console.log(`'effectCalled'`, 'effectCalled')
    window.addEventListener('keydown', listener)
    return () => {
      window.removeEventListener('keydown', listener)
    }
  })

  return (
    <AppThemeProvider>
      <FCol className="items-center">
        <FCol p={3} width={'30em'}>
          <InputText
            autoFocus
            onEnter={() => dispatch({ type: 'TopInputSubmit' })}
            value={state.inputValue}
            onChange={inputValue =>
              dispatch({ type: 'TopInputChanged', inputValue })
            }
          />
          <FCol pt={3} className="">
            <GrainList state={state} dispatch={dispatch} />
          </FCol>
        </FCol>
      </FCol>
    </AppThemeProvider>
  )
}

export default App

// HELPERS
