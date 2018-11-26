import React from 'react'

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

const Input = ({ name, ...otherProps }) => {
  return <div>{name || 'Hello'}</div>
}

Input.propTypes = {}

Input.defaultProps = {}

export default Input
