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
      link: chapter.fields.slug,
      title: chapter.frontmatter.title,
    }))

  const grouped = groupBy(tutorials, md => extractGroup(md.link))

  return Object.keys(grouped).reduce((acc, curr) => {
    const steps = grouped[curr]
    return {
      ...acc,
      [curr]: sortBy(steps, step =>
        parseInt(step.link.split('/')[4].split('-')[0], 10),
      ),
    }
  }, {})
}

export function extractGroup(slug) {
  return slug.split('/')[3]
}
