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

const GrainEditItem = React.memo(
  ({ title, grain, dispatch, ...otherProps }) => {
    return (
      <InputText
        // className={`bb b--light-gray ${isSelected ? 'bg-light-blue' : ''}`}
        value={title}
        onChange={title => dispatch({ type: 'OnEditGrainTitleChange', title })}
        onEnter={() => dispatch({ type: 'OnEndEditModeTrigger' })}
        onFocus={() => dispatch({ type: 'OnEditGrainTitleFocus', grain })}
        {...otherProps}
      />
    )
  },
)
GrainEditItem.propTypes = {}

GrainEditItem.defaultProps = {}

export default GrainEditItem
