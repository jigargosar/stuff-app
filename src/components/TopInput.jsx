//<editor-fold desc="Default Imports">
// @formatter:off
/* eslint-disable no-unused-vars, no-empty-pattern */
// noinspection all
import PropTypes from 'prop-types'
// noinspection all
import R from 'ramda'
import {hotKeys} from '../hotKeys'
/* eslint-enable no-unused-vars */
// @formatter:on
//</editor-fold>
import React from 'react'
import InputText from './InputText'
import {
  createGrainWithTitle,
  debounceFocusId,
  getGrainDomId,
  getInputValue,
  insertGrain,
  resetInputValue,
  setInputValue,
  setSidxToGrain,
} from '../state'

export function onTopInputSubmit(immerState) {
  immerState(state => {
    const title = getInputValue(state).trim()
    if (title) {
      const grain = createGrainWithTitle(title)

      resetInputValue(immerState)
      insertGrain(grain, immerState)
      setSidxToGrain(grain, immerState)
      debounceFocusId(getGrainDomId(grain))
    }
  })
}

const TopInput = ({ state, immerState, setState }) => (
  <InputText
    value={getInputValue(state)}
    onChange={iv => setInputValue(iv, immerState)}
    onKeyDown={hotKeys(['Enter', () => onTopInputSubmit(immerState)])}
  />
)

TopInput.propTypes = {}

TopInput.defaultProps = {}

export default TopInput
