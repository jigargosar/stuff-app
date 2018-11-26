import { isNil } from 'ramda'
import { debounceFocusId, getGrainDomId } from './state'

export function storageGetOr(defaultValue, key) {
  try {
    let item = localStorage.getItem(key)
    if (isNil(item)) return defaultValue
    return JSON.parse(item)
  } catch (e) {
    return defaultValue
  }
}

export function storageSet(key, value) {
  if (isNil(value) || isNil(key)) {
    console.warn('Invalid Args', 'storageSet', key, value)
    return
  }
  localStorage.setItem(key, JSON.stringify(value))
}

export function debounceFocusGrain(grain) {
  debounceFocusId(getGrainDomId(grain))
}
