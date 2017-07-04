import { Step } from '../types'
export function getTotalDuration(steps: Step[]) {
  return steps.reduce((acc, curr) => acc + (curr.duration || 0), 0)
}
