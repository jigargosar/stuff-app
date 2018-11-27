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

export function CheckBox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={ev => onChange(ev.target.checked, ev)}
    />
  )
}

CheckBox.propTypes = {
  onChange: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
}

CheckBox.defaultProps = {}

export default CheckBox
