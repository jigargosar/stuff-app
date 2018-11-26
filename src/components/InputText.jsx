//<editor-fold desc="Default Imports">
// @formatter:off
/* eslint-disable no-unused-vars, no-empty-pattern */
// noinspection all
import PropTypes from 'prop-types'
// noinspection all
import R from 'ramda'
/* eslint-enable no-unused-vars */
// @formatter:on
//</editor-fold>
import React from 'react'
import styled from 'styled-components'
import { space, width } from 'styled-system'

export const StyledInput = styled.input`
  ${space} ${width};
`

StyledInput.propTypes = {
  ...space.propTypes,
  ...width.propTypes,
}

export function InputText({ value, onChange, ...otherProps }) {
  return (
    <StyledInput
      type="text"
      value={value}
      onChange={ev => onChange(ev.target.value, ev)}
      {...otherProps}
    />
  )
}

InputText.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  ...StyledInput.propTypes,
}

InputText.defaultProps = {}

export default InputText
