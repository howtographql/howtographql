import authors, { Author } from '../data/authors'
import data from '../data/stacks'

export function getAuthorByGroup(group: string): Author {
  const stack = data.find(s => s.key === group)
  if (stack) {
    return authors[stack.authorName]
  }

  return authors['Nikolas Burk']
}
