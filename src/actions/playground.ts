import { Action } from '../reducers/quiz'
export const setEndpoint = (payload: string): Action => ({
  payload,
  type: 'set endpoint',
})

export const increaseExecutionCount = (): Action => ({
  type: 'increase execution count',
})
