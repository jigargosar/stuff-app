import * as R from 'ramda'
import { compose } from 'ramda'
import debounce from 'lodash.debounce'

function focusDomId(domId) {
  try {
    document.getElementById(domId).focus()
  } catch (e) {
    console.error('Focus Failed:', domId)
  }
}

export const debounceFocusDomId = debounce(focusDomId)
export const pd = ev => {
  ev.preventDefault()
}
export const wrapPD = fn =>
  compose(
    fn,
    R.tap(pd),
  )
