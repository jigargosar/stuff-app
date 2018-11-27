import { compose, defaultTo, find, identity } from 'ramda'
import isHotkey from 'is-hotkey/src'

export function hotKeys(...mappings) {
  return function(ev) {
    return compose(
      ([keys, handler]) => handler(ev),
      defaultTo([null, identity]),
      find(([keys]) => isHotkey(keys, ev)),
    )(mappings)
  }
}
