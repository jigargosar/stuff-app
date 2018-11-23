import React, { Component } from 'react'

class Grain extends Component {
  render() {
    return (
      <p>
        <small>{this.props.sortIdx}</small>
        {' : '}
        <span>{this.props.title}</span>
      </p>
    )
  }
}

export default Grain
