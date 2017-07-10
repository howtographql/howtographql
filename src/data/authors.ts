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
  {
    avatar: require('../assets/graphics/contributors/radoslav.jpg'),
    bio:
      'Radoslav is a developer for more than a decade and the organizer of React.Sofia meetup. He believes that frontend and backend are equally important and GraphQL is the best way to connect them. ',
    job: 'Developer @ Product Hunt',
    link: 'https://twitter.com/rstankov',
    name: 'Radoslav Stankov',
  },
  {
    avatar: require('../assets/graphics/contributors/bojan.jpg'),
    bio:
      "Bojan is an experienced Java developer (and an Elixir newbie) with a healthy interest in new takes on old problems, from programming paradigms (like functional-reactive), to innovative approaches to API design (like GraphQL).",
    job: 'Senior Engineer @ ServiceNow',
    link: 'https://twitter.com/kaqqao',
    name: 'Bojan Tomic',
  },
  {
    avatar: require('../assets/graphics/contributors/maira.png'),
    bio:
      "Maira is a software engineer at VTEX, currently working with GraphQL every day. She loves web development and learning new technologies that make it even more enjoyable.",
    job: 'Developer @ VTEX',
    link: 'https://github.com/mairatma',
    name: 'Maira Bello',
  },
]

export default keyBy(authors, 'name')
