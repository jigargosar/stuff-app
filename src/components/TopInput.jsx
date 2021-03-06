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

const TopInput = React.memo(({ value, dispatch }) => {
  return (
    <InputText
      autoFocus
      onEnter={() => dispatch({ type: 'TopInputSubmit' })}
      value={value}
      onChange={inputValue => dispatch({ type: 'TopInputChanged', inputValue })}
    />
  )
})

TopInput.propTypes = {
  dispatch: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
}

TopInput.defaultProps = {}

export default TopInput
