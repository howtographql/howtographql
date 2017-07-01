import { Action } from '../reducers/quiz'
export const setOverlayVisible = (payload: boolean): Action => ({
  payload,
  type: 'set overlay visible',
})
