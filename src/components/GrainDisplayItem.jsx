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
import { hotKeys } from '../hotKeys'
import { deleteGrain, getGrainDomId, grainSetDoneProp, startEditingSelectedGrain } from '../state'
import { Box } from 'rebass'
import CheckBox from './CheckBox'
import { FRowCY } from './styled'

const GrainDisplayItem = ({ isSelected, grain, immerState, ...otherProps }) => {
  return <FRowCY
    py={2}
    className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
    onKeyDown={hotKeys([
      'Enter',
      ev => {
        if (ev.target.id === getGrainDomId(grain)) {
          startEditingSelectedGrain(immerState)
        }
      },
    ])}
    {...otherProps}
  >
    <Box p={2}>
      <CheckBox
        value={grain.done}
        onChange={bool => grainSetDoneProp(bool, grain, immerState)}
      />
    </Box>
    <Box className="flex-auto">{grain.title}</Box>
    <button onClick={() => deleteGrain(grain, immerState)}>X</button>
  </FRowCY>
}

GrainDisplayItem.propTypes = {}

GrainDisplayItem.defaultProps = {}

export default GrainDisplayItem
