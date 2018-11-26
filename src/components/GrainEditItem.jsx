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
import { hotKeys } from '../hotKeys'
import { endEditMode, onEditGrainTitleChange, setSidxToGrain } from '../state'

const GrainEditItem = ({ title, grain,immerState, ...otherProps }) => {
  return <InputText
    // className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
    value={title}
    onChange={title => onEditGrainTitleChange(title, immerState)}
    onKeyDown={hotKeys(['Enter', () => endEditMode(immerState)])}
    onFocus={() => setSidxToGrain(grain, immerState)}
    {...otherProps}
  />
}

GrainEditItem.propTypes = {}

GrainEditItem.defaultProps = {}

export default GrainEditItem
