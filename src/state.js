import * as R from 'ramda'
import { compose, isNil, mergeDeepRight } from 'ramda'
import debounce from 'lodash.debounce'
import * as invariant from 'invariant'
import nanoid from 'nanoid'
import { hotKeys } from './hotKeys'
import { storageGetOr, storageSet } from './storage'
import { isDraft } from 'immer'
// STORAGE

const appStateStorageKey = () => 'app-state'

export function cacheAppState(state) {
  storageSet(appStateStorageKey(), state)
}

export function restoreAppState() {
  const defaultState = {
    inputValue: '',
    lookup: {},
    sidx: -1,
    edit: null,
  }

  return compose(mergeDeepRight(defaultState))(
    storageGetOr({}, appStateStorageKey()),
  )
}

//UPDATE
export const update = fn => (...args) => {
  const immerState = R.last(args)
  const isFunc = R.is(Function, immerState)
  invariant(
    isDraft(immerState) || isFunc,
    'ImmerState should either be a function or draft',
  )
  if (isFunc) {
    return immerState(state => {
      fn(state)(...args)
    })
  } else {
    return fn(immerState)(...args)
  }
}

// STATE GET/SET
export function createGrainWithTitle(title) {
  invariant(!isNil(title), `null arg title:${title}`)
  return {
    id: 'grain--' + nanoid(),
    ca: Date.now(),
    ma: Date.now(),
    title,
    desc: '',
    done: false,
  }
}

export const onEditGrainTitleChange = update(state => title => {
  const edit = state.edit
  if (edit) {
    edit.title = title
  } else {
    console.error('Trying to update edit mode, while not editing')
  }
})

export const setInputValue = update(state => iv => {
  state.inputValue = iv
})

const resetInputValue = update(state => () => {
  state.inputValue = ''
})

const insertGrain = update(state => grain => {
  state.lookup[grain.id] = grain
})

export function getInputValue(state) {
  return state.inputValue
}

export const setSidxToGrain = update(state => grain => {
  state.sidx = currentGrains(state).findIndex(g => g.id === grain.id)
})

function currentGrains(state) {
  return R.values(state.lookup)
}

const pd = ev => {
  ev.preventDefault()
}

const wrapPD = fn =>
  compose(
    fn,
    R.tap(pd),
  )

export function getGrainDomId(grain) {
  return 'grain-li--' + grain.id
}

function focusId(domId) {
  try {
    document.getElementById(domId).focus()
  } catch (e) {
    console.error('Focus Failed:', domId)
  }
}

const debounceFocusId = debounce(focusId)

function focusGrain(grain) {
  debounceFocusId(getGrainDomId(grain))
}

const rollSelectionBy = update(state => offset => {
  const grains = currentGrains(state)
  const grainsLength = grains.length
  if (grainsLength > 1) {
    const clampedSidx = R.clamp(0, grains.length - 1, state.sidx)
    state.sidx = R.mathMod(clampedSidx + offset, grainsLength)
    debounceFocusId(getGrainDomId(grains[state.sidx]))
  }
})

export function onWindowKeydown(state, immerState) {
  return ev => {
    const tagName = ev.target.tagName
    console.debug(ev, tagName)
    if (tagName === 'INPUT' || tagName === 'BODY') {
      hotKeys(
        ['ArrowUp', wrapPD(() => console.debug('ev tapped', ev))],
        ['ArrowDown', pd],
      )(ev)
    } else {
    }

    const sidxGrain = getMaybeGrainAtSidx(state)
    if (sidxGrain && ev.target.id !== getGrainDomId(sidxGrain)) {
      hotKeys(
        ['ArrowUp', () => debounceFocusId(getGrainDomId(sidxGrain))],
        ['ArrowDown', () => debounceFocusId(getGrainDomId(sidxGrain))],
      )(ev)
    } else {
      hotKeys(
        ['ArrowUp', () => rollSelectionBy(-1, immerState)],
        ['ArrowDown', () => rollSelectionBy(1, immerState)],
      )(ev)
    }
  }
}

export function mapGrains(fn, state) {
  const grains = currentGrains(state)
  if (grains.length > 0) {
    const sidx = R.clamp(0, grains.length - 1, state.sidx)
    return grains.map((grain, idx) =>
      fn({ grain, isSelected: sidx === idx, edit: state.edit }),
    )
  } else {
    return []
  }
}

function getMaybeGrainAtSidx(state) {
  const grains = currentGrains(state)
  const grainsLength = grains.length
  if (grainsLength > 0) {
    const clampedSidx = R.clamp(0, grains.length - 1, state.sidx)
    return grains[clampedSidx]
  }
}

export const startEditingSelectedGrainTrigger = update(state => () => {
  startEditingSelectedGrain(state)
  focusGrainAtSidx(state)
})

export const startEditingSelectedGrain = update(state => () => {
  const edit = state.edit
  if (edit) {
    console.warn('Handle start editing when already in edit mode')
  } else {
    const grain = getMaybeGrainAtSidx(state)
    if (grain) {
      state.edit = { grainId: grain.id, title: grain.title }
    }
  }
})

export const endEditMode = update(state => () => {
  const edit = state.edit
  if (edit) {
    const title = edit.title.trim()
    if (title) {
      state.lookup[edit.grainId].title = title
    }
    state.edit = null
  } else {
    console.error('Trying to end edit mode, while not editing')
  }
})

function focusGrainAtSidx(state) {
  const grain = getMaybeGrainAtSidx(state)
  invariant(!isNil(grain), 'Cannot focus nil grain')
  focusGrain(grain)
}

export const onEndEditModeTrigger = update(state => () => {
  endEditMode(state)
  focusGrainAtSidx(state)
})

export const grainSetDoneProp = update(state => (bool, g) => {
  state.lookup[g.id].done = bool
})

export const deleteGrain = update(state => grain => {
  delete state.lookup[grain.id]
})

export const onTopInputSubmit = update(draft => () => {
  const title = getInputValue(draft).trim()
  if (title) {
    const grain = createGrainWithTitle(title)

    resetInputValue(draft)
    insertGrain(grain, draft)
    setSidxToGrain(grain, draft)
    focusGrain(grain)
  }
})
