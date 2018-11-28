//<editor-fold desc="Default Imports">
// @formatter:off
/* eslint-disable no-unused-vars, no-empty-pattern */
// noinspection all
import PropTypes from 'prop-types'
// noinspection all
import * as R from 'ramda'
import React from 'react'
/* eslint-enable no-unused-vars */
// @formatter:on
//</editor-fold>
import { hotKeys } from '../HotKeys'
import { getGrainDomId } from '../State'
import { Box } from 'rebass'
import CheckBox from './CheckBox'
import { FRowCY } from './styled'

const GrainDisplayItem = React.memo(
  ({ isSelected, grain, dispatch, ...otherProps }) => (
    <FRowCY
      py={2}
      className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
      onKeyDown={hotKeys([
        'Enter',
        ev => {
          if (ev.target.id === getGrainDomId(grain)) {
            dispatch({ type: 'StartEditingSelectedGrainTrigger' })
          }
        },
      ])}
      {...otherProps}
    >
      <Box p={2}>
        <CheckBox
          checked={grain.done}
          onChange={done =>
            dispatch({ type: 'OnGrainDoneChange', grain, done })
          }
        />
      </Box>
      <Box className="flex-auto">{grain.title}</Box>
      <button onClick={() => dispatch({ type: 'DeleteGrain', grain })}>
        X
      </button>
    </FRowCY>
  ),
)
GrainDisplayItem.propTypes = {
  grain: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
}

GrainDisplayItem.defaultProps = {}

export default GrainDisplayItem
