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
  restoreAppState,
  rollSelectionBy,
} from './State'
import GrainItem from './components/GrainItem'
import { hotKeys } from './HotKeys'
import TopInput from './components/TopInput'

const GrainList = React.memo(({ state, dispatch }) =>
  mapGrains(
    ({ grain, isSelected, edit }) => (
      <GrainItem key={grain.id} {...{ grain, isSelected, edit, dispatch }} />
    ),
    state,
  ),
)
function appReducer(state, action) {
  console.log(action.type)
  switch (action.type) {
    case 'reset':
      return restoreAppState()
    case 'TopInputChanged':
      return { ...state, inputValue: action.inputValue }
    case 'TopInputSubmit':
      return onTopInputSubmit(state)

    case 'RollSelectionBy':
      return rollSelectionBy(action.offset, state)

    case 'ArrowUp':
      return state

    case 'ArrowDown':
      return state

    default:
      // A reducer must always return a valid state.
      // Alternatively you can throw an error if an invalid action is dispatched.
      console.error('Invalid Action', action, state)
      return state
  }
}

function onWindowHotKeyDown(ev, dispatch) {
  const targetId = ev.target.id
  return hotKeys(
    ['ArrowUp', () => dispatch({ type: 'ArrowUp', targetId })],
    ['ArrowDown', () => dispatch({ type: 'ArrowDown', targetId: targetId })],
  )(ev)
}

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
  const [state, dispatch] = React.useReducer(appReducer, restoreAppState())
  React.useEffect(() => cacheAppState(state))

  useWindowKeyDownEffect(onWindowHotKeyDown, dispatch)

  return (
    <AppThemeProvider>
      <FCol css={{ minHeight: '100vh' }} className="items-center">
        <FCol p={3} width={'30em'}>
          <TopInput value={state.inputValue} dispatch={dispatch} />
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
