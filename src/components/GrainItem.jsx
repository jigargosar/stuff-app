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
import { getGrainDomId } from '../state'
import GrainEditItem from './GrainEditItem'
import GrainDisplayItem from './GrainDisplayItem'

const GrainItem = ({ grain, isSelected, edit, immerState , setState}) =>  {
  const grainDomId = getGrainDomId(grain)
  const commonProps = {
    id: grainDomId,
    tabIndex: isSelected ? 0 : null,
    key: grain.id,
    setState
  }
  if (edit && edit.grainId === grain.id) {
    const title = edit.title
    return (
      <GrainEditItem
        {...commonProps}
        // className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
        title={title}
        grain={grain}
        immerState={immerState}
      />
    )
  } else {
    return (
      <GrainDisplayItem
        {...commonProps}
        {...{ grain, isSelected, immerState }}
      />
    )
  }
}

GrainItem.propTypes = {}

GrainItem.defaultProps = {}

export default GrainItem
