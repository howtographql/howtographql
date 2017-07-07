import * as keyBy from 'lodash/keyBy'

export interface Author {
  avatar: string
  name: string
  job: string
  bio: string
  link: string
}

const authors: Author[] = [
  {
    avatar: require('../assets/graphics/contributors/nikolas.jpg'),
    bio:
      "Nikolas is a developer and head of content at Graphcool. He is excited about GraphQL as a new API technology and has a passion for learning and sharing knowledge.",
    job: 'Developer @ Graphcool',
    link: 'https://twitter.com/nikolasburk',
    name: 'Nikolas Burk',
  },
  {
    avatar: require('../assets/graphics/contributors/abhi.jpg'),
    bio:
      'Abhi Aiyer is the cohost of GraphQL Radio and a Senior Engineer working at Workpop.',
    job: 'Senior Engineer @ Workpop',
    link: 'https://twitter.com/AbhiAiyer',
    name: 'Abhi Aiyer',
  },
]

export default keyBy(authors, 'name')
