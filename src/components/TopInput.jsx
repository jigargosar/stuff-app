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
import InputText from './InputText'
import { getInputValue, onTopInputSubmit, setInputValue } from '../state'
import { hotKeys } from '../hotKeys'

const TopInput = ({state, immerState, setState}) => (
  <InputText
    value={getInputValue(state)}
    onChange={iv => setInputValue(iv, immerState)}
    onKeyDown={hotKeys(['Enter', () => onTopInputSubmit(immerState)])}
  />
)

TopInput.propTypes = {}

TopInput.defaultProps = {}

export default TopInput
