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
import styled from 'styled-components'
import { space, width } from 'styled-system'
import { hotKeys } from '../hotKeys'

export const StyledInput = styled.input`
  ${space} ${width};
`

StyledInput.propTypes = {
  ...space.propTypes,
  ...width.propTypes,
}

export function InputText({ value, onChange, onEnter, ...otherProps }) {

  return (
    <StyledInput
      type="text"
      value={value}
      onChange={ev => onChange(ev.target.value, ev)}
      onKeyDown={onEnter ? hotKeys(['Enter', onEnter]) : null}
      {...otherProps}
    />
  )
}

InputText.propTypes = {
  onChange: PropTypes.func.isRequired,
  onEnter: PropTypes.func,
  p: PropTypes.number,
  value: PropTypes.string.isRequired
}

InputText.defaultProps = {
  p: 3
}

export default InputText
