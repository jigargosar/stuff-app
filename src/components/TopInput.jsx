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
import { useCacheState } from './hooks'

const TopInput = ({ onSubmit }) => {
  const [value, setValue] = useCacheState('inputValue', '')
  return (
    <InputText
      autoFocus
      onEnter={() => onSubmit(value, setValue)}
      value={value}
      onChange={setValue}
    />
  )
}

TopInput.propTypes = {}

TopInput.defaultProps = {}

export default TopInput
