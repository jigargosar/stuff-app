//<editor-fold desc="Default Imports">
// @formatter:off
/* eslint-disable no-unused-vars, no-empty-pattern */
// noinspection all
import PropTypes from 'prop-types'
// noinspection all
import * as R from 'ramda'
/* eslint-enable no-unused-vars */
// @formatter:on
//</editor-fold>
import React from 'react'
import InputText from './InputText'
import { onTopInputSubmit } from '../State'
import { storageGetOr, storageSet } from '../local-cache'

function useCacheState(key, initialValue) {
  const [state, setState] = React.useState(storageGetOr(initialValue, key))
  React.useEffect(() => storageSet(key, state))
  return [state, setState]
}

const TopInput = ({ state, setState }) => {
  const [value, setValue] = useCacheState('inputValue', '')
  return (
    <InputText
      autoFocus
      onEnter={() => setState(onTopInputSubmit([value, setValue]))}
      value={value}
      onChange={setValue}
    />
  )
}

TopInput.propTypes = {}

TopInput.defaultProps = {}

export default TopInput
