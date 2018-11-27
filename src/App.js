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

function App() {
  const [state, setState] = React.useState(restoreAppState)
  React.useEffect(() => cacheAppState(state))

  React.useEffect(() => {
    const listener = onWindowKeydown(state, setState)
    window.addEventListener('keydown', listener)
    return () => {
      window.removeEventListener('keydown', listener)
    }
  })

  const renderGrains = GrainList({ state, setState })
  return (
    <AppThemeProvider>
      <FCol className="items-center">
        <FCol p={3} width={'30em'}>
          <TopInput {...{ state, setState }} />
          <FCol pt={3} className="">
            {renderGrains}
          </FCol>
        </FCol>
      </FCol>
    </AppThemeProvider>
  )
}

export default App

// HELPERS
