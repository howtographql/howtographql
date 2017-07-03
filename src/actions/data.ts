import { Action } from '../reducers/quiz'

export const setPersonData = (
  payload: Array<{ [key: string]: any }>,
): Action => ({
  payload,
  type: 'set person data',
})

export const setPostData = (
  payload: Array<{ [key: string]: any }>,
): Action => ({
  payload,
  type: 'set post data',
})
