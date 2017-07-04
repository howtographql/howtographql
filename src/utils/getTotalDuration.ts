import { Step } from '../types'
export function getTotalDuration(steps: Step[]) {
  if (!steps) {
    return 0
  }
  return steps.reduce((acc, curr) => acc + (curr.duration || 0), 0)
}
