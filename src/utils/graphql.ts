import { MarkdownRemark, RelayConnection, Step } from '../types'
import * as groupBy from 'lodash/groupBy'
import * as sortBy from 'lodash/sortBy'

export function extractSteps(
  mds: RelayConnection<MarkdownRemark>,
): { [key: string]: Step[] } {
  const tutorials = mds.edges
    .map(edge => edge.node)
    .filter(n => n.frontmatter.title.length > 0)
    .map(chapter => ({
      description: chapter.frontmatter.description,
      link: chapter.fields.slug,
      title: chapter.frontmatter.title,
    }))

  const grouped = groupBy(tutorials, md => extractGroup(md.link))

  return Object.keys(grouped).reduce((acc, curr) => {
    const steps = grouped[curr]
    return {
      ...acc,
      [curr]: sortBy(steps, step => {
        const splittedLink = step.link.split('/')
        let leadingNumber = '0'
        if (splittedLink.length > 4) {
          leadingNumber = splittedLink[4].split('-')[0]
        }
        return parseInt(leadingNumber, 10)
      }),
    }
  }, {})
}

export function extractGroup(slug) {
  const splittedSlug = slug.split('/')
  if (splittedSlug.length > 3) {
    return splittedSlug[3]
  }
  if (slug.includes('/choose')) {
    return 'choose'
  }
  return ''
}
