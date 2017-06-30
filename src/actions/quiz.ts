import { Action, QuizReaction } from '../reducers/quiz'
export const setRememberSkipped = (payload: boolean): Action => ({
  payload,
  type: 'remember skipped',
})
export const answerCorrectly = (path: string): Action => ({
  path,
  type: 'answer correctly',
})
export const addAnswer = (path: string, answer: number): Action => ({
  path,
  payload: answer,
  type: 'add answer',
})
export const skip = (path: string): Action => ({ type: 'skip', path })
export const setReaction = (path: string, payload: QuizReaction): Action => ({
  path,
  payload,
  type: 'set reaction',
})
