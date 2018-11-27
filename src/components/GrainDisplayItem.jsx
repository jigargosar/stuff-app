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
import { hotKeys } from '../hotKeys'
import {
  deleteGrain,
  getGrainDomId,
  onGrainDoneChange,
  startEditingSelectedGrainTrigger,
} from '../state'
import { Box } from 'rebass'
import CheckBox from './CheckBox'
import { FRowCY } from './styled'

const GrainDisplayItem = ({
  isSelected,
  grain,
  immerState,
  setState,
  ...otherProps
}) => {
  return (
    <FRowCY
      py={2}
      className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
      onKeyDown={hotKeys([
        'Enter',
        ev => {
          if (ev.target.id === getGrainDomId(grain)) {
            startEditingSelectedGrainTrigger(immerState)
          }
        },
      ])}
      {...otherProps}
    >
      <Box p={2}>
        <CheckBox
          checked={grain.done}
          onChange={bool => setState(onGrainDoneChange(bool, grain))}
        />
      </Box>
      <Box className="flex-auto">{grain.title}</Box>
      <button onClick={() => setState(deleteGrain(grain))}>X</button>
    </FRowCY>
  )
}

GrainDisplayItem.propTypes = {
  grain: PropTypes.object.isRequired,
  immerState: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
}

GrainDisplayItem.defaultProps = {}

export default GrainDisplayItem
