import data from '../data/stacks'

const localMap = {
  advanced: 'Advanced',
  basics: 'Basics',
}

export function getStackName(group: string): string | null {
  if (localMap[group]) {
    return localMap[group]
  }

  const stack = data.find(s => s.key === group)

  if (stack) {
    return stack.title
  }

  return null
}
