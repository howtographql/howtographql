import { Step } from '../types'
import data from '../data/stacks'

export function getFrontendTutorials(steps: { [key: string]: Step[] }) {
  return data.filter(t => t.type === 'frontend').map(stack => {
    const tutorialSteps = steps[stack.key]
    return {
      ...tutorialSteps[0],
      title: stack.title,
    }
  })
}

export function getBackendTutorials(steps: { [key: string]: Step[] }) {
  return data.filter(t => t.type === 'backend').map(stack => {
    const tutorialSteps = steps[stack.key]
    return {
      ...tutorialSteps[0],
      title: stack.title,
    }
  })
}
