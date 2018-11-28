//<editor-fold desc="Default Imports">
// @formatter:off
/* eslint-disable no-unused-vars, no-empty-pattern */
// noinspection all
import PropTypes from 'prop-types'
// noinspection all
import * as R from 'ramda'
import React from 'react'
import { getGrainDomId } from '../State'
import GrainEditItem from './GrainEditItem'
import GrainDisplayItem from './GrainDisplayItem'
/* eslint-enable no-unused-vars */
// @formatter:on
//</editor-fold>

const GrainItem = React.memo(({ grain, isSelected, edit, dispatch }) => {
  const grainDomId = getGrainDomId(grain)
  const commonProps = {
    id: grainDomId,
    tabIndex: isSelected ? 0 : null,
    key: grain.id,
    dispatch,
  }
  if (edit && edit.grainId === grain.id) {
    const title = edit.title
    return (
      <GrainEditItem
        {...commonProps}
        // className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
        title={title}
        grain={grain}
      />
    )
  } else {
    return (
      <GrainDisplayItem
        {...commonProps}
        {...{ grain, isSelected}}
      />
    )
  }
}
)
GrainItem.propTypes = {}

GrainItem.defaultProps = {}

export default GrainItem
