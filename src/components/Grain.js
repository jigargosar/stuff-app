import PropTypes from 'prop-types'
import React, { Component } from 'react'
import cn from 'classname'
import './Grain.css'

class Grain extends Component {
  static propTypes = {
    isSelected: PropTypes.bool.isRequired,
    sortIdx: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  }

  render() {
    const selected = this.props.isSelected
    return (
      <div
        onFocus={this.props.onFocus}
        tabIndex={selected ? 0 : -1}
        className={cn('Grain', { 'Grain-root-selected': selected })}
      >
        <small>{this.props.sortIdx}</small>
        {' : '}
        <span>{this.props.title}</span>
      </div>
    )
  }
}

export default Grain
