import React from 'react'
import { storageGetOr, storageSet } from '../local-cache'

export function useCacheState(key, initialValue) {
  const [state, setState] = React.useState(storageGetOr(initialValue, key))
  React.useEffect(() => storageSet(key, state))
  return [state, setState]
}
