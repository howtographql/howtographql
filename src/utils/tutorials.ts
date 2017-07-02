import { Step } from '../types'
import data from '../data/stacks'

export function getFrontendTutorials(steps: { [key: string]: Step[] }) {
  return data.filter(t => t.type === 'frontend' && !t.comingSoon).map(stack => {
    const tutorialSteps = steps[stack.key]
    return {
      ...tutorialSteps[0],
      title: stack.title,
    }
  })
}

export function getBackendTutorials(steps: { [key: string]: Step[] }) {
  return data.filter(t => t.type === 'backend' && !t.comingSoon).map(stack => {
    const tutorialSteps = steps[stack.key]
    return {
      ...tutorialSteps[0],
      title: stack.title,
    }
  })
}
