import * as R from 'ramda'
import { compose, isNil, mergeDeepRight } from 'ramda'
import * as invariant from 'invariant'
import nanoid from 'nanoid'
import { hotKeys } from './HotKeys'
import { storageGetOr, storageSet } from './local-cache'
import { debounceFocusDomId, pd } from './Dom'
import validate from 'aproba'

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

// STATE GET/SET
function createGrainWithTitle(title) {
  validate('S', [title])
  return {
    id: 'grain--' + nanoid(),
    ca: Date.now(),
    ma: Date.now(),
    title,
    desc: '',
    done: false,
  }
}
const editLens = R.lensProp('edit')
const titleLens = R.lensProp('title')

const editTitleLens = R.compose(
  editLens,
  titleLens,
)

export const onEditGrainTitleChange = title => R.set(editTitleLens)(title)
const sidxLens = R.lensProp('sidx')

const grainLens = grain => grainLensWithId(grain.id)
const grainLensWithId = id => R.lensPath(['lookup', id])

const upsertGrain = grain => R.set(grainLens(grain))(grain)

const grainSidxLens = grain =>
  R.lens(idxOfGrain(grain), (grain, state) =>
    R.set(sidxLens)(idxOfGrain(grain)(state))(state),
  )

const findIndexByIdProp = ({ id }) => R.findIndex(R.propEq('id', id))

const idxOfGrain = grain =>
  R.compose(
    findIndexByIdProp(grain),
    currentGrains,
  )

const setSidxToGrain = grain => R.set(grainSidxLens(grain), grain)
export const onEditGrainTitleFocus = setSidxToGrain

function currentGrains(state) {
  return R.compose(
    R.sortWith([R.descend(R.prop('ca'))]),
    R.values,
  )(state.lookup)
}

export function getGrainDomId(grain) {
  return 'grain-li--' + grain.id
}

function focusGrainEffect(grain) {
  debounceFocusDomId(getGrainDomId(grain))
}

const rollSelectionBy = R.curry((offset, state) => {
  const grains = currentGrains(state)
  const grainsLength = grains.length
  if (grainsLength > 1) {
    const clampedSidx = R.clamp(0, grains.length - 1, state.sidx)
    return R.compose(
      focusGrainAtSidxEffect,
      R.set(sidxLens)(R.mathMod(clampedSidx + offset, grainsLength)),
    )(state)
  }
})

function isTargetSidxGrain(ev, state) {
  const sidxGrain = getMaybeSidxGrain(state)
  return sidxGrain && ev.target.id !== getGrainDomId(sidxGrain)
}

export function onWindowKeydown(state, setState) {
  return ev => {
    const tagName = ev.target.tagName
    console.debug(ev, tagName)
    if (tagName === 'INPUT' || tagName === 'BODY') {
      hotKeys(['ArrowUp', pd], ['ArrowDown', pd])(ev)
    }

    const keymap = isTargetSidxGrain(ev, state)
      ? [['ArrowUp', 'ArrowDown'], () => focusGrainAtSidxEffect(state)]
      : (['ArrowUp', () => setState(rollSelectionBy(-1))],
        ['ArrowDown', () => setState(rollSelectionBy(1))])

    hotKeys(keymap)(ev)
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

function getMaybeSidxGrain(state) {
  const grains = currentGrains(state)
  const grainsLength = grains.length
  if (grainsLength > 0) {
    const clampedSidx = R.clamp(0, grains.length - 1, state.sidx)
    return grains[clampedSidx]
  }
}

export const startEditingSelectedGrainTrigger = R.compose(
  focusGrainAtSidxEffect,
  startEditingSelectedGrain,
)

export function startEditingSelectedGrain(state) {
  const edit = state.edit
  if (edit) {
    console.warn('Handle start editing when already in edit mode')
  } else {
    const grain = getMaybeSidxGrain(state)
    if (grain) {
      return R.set(editLens)({ grainId: grain.id, title: grain.title })(state)
    }
  }
  return state
}

const setGrainTitleIfNotEmpty = R.curry((title, grainId, state) => {
  if (title) {
    return R.set(grainIdTitleLens(grainId), title, state)
  }
  return state
})

export const endEditMode = state => {
  const edit = state.edit
  if (edit) {
    const title = edit.title.trim()
    const grainId = edit.grainId
    return compose(
      R.set(editLens)(null),
      setGrainTitleIfNotEmpty(title, grainId),
    )(state)
  } else {
    console.error('Trying to end edit mode, while not editing')
  }
}

function focusGrainAtSidxEffect(state) {
  const grain = getMaybeSidxGrain(state)
  invariant(!isNil(grain), 'Cannot focus nil grain')
  focusGrainEffect(grain)
  return state
}

export const onEndEditModeTrigger = R.compose(
  R.tap(focusGrainAtSidxEffect),
  endEditMode,
)

const grainDoneLens = grain =>
  R.compose(
    grainLens(grain),
    R.lensProp('done'),
  )

const grainIdTitleLens = grainId =>
  R.compose(
    grainLensWithId(grainId),
    titleLens,
  )

export const onGrainDoneChange = (bool, grain) =>
  R.set(grainDoneLens(grain), bool)

const lookupLens = R.lensProp('lookup')

export const deleteGrain = grain => R.over(lookupLens)(R.omit([grain.id]))

export const onTopInputSubmit = ([value, setValue]) => state => {
  const title = value.trim()
  if (title) {
    const grain = createGrainWithTitle(title)
    setValue('')
    return R.compose(
      R.tap(() => focusGrainEffect(grain)),
      setSidxToGrain(grain),
      upsertGrain(grain),
    )(state)
  }
  return state
}
