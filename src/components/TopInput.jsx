//<editor-fold desc="Default Imports">
// @formatter:off
/* eslint-disable no-unused-vars, no-empty-pattern */
// noinspection all
import PropTypes from 'prop-types'
// noinspection all
import * as R from 'ramda'
// noinspection all
import immer, {produce} from 'immer'
/* eslint-enable no-unused-vars */
// @formatter:on
//</editor-fold>
import React from 'react'
import InputText from './InputText'
import { hotKeys } from '../hotKeys'
import {
  createGrainWithTitle,
  getInputValue,
  insertGrain,
  resetInputValue,
  setInputValue,
  setSidxToGrain,
} from '../state'
import { debounceFocusGrain } from '../store'

const toImmer = setter =>
  R.compose(
    setter,
    produce,
  )

function onTopInputSubmit(immerState) {
  return immerState(state => {
    const title = getInputValue(state).trim()
    if (title) {
      const grain = createGrainWithTitle(title)

      resetInputValue(immerState)
      insertGrain(grain, immerState)
      setSidxToGrain(grain, immerState)
      debounceFocusGrain(grain)
    }
  })
}


const TopInput = ({ state, immerState }) => (
  <InputText
    value={getInputValue(state)}
    onChange={iv => setInputValue(iv)}
    onKeyDown={hotKeys(['Enter', () => onTopInputSubmit(immerState)])}
  />
)

TopInput.propTypes = {}

TopInput.defaultProps = {}

export default TopInput
