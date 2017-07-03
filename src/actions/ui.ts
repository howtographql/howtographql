import { Action } from '../reducers/quiz'

export const setSearchVisible = (payload: boolean): Action => ({
  payload,
  type: 'set search visible',
})

export const hideOverlay = (): Action => ({
  type: 'hide overlay',
})

export const setOverviewVideoVisible = (payload: boolean): Action => ({
  payload,
  type: 'set overview video visible',
})
