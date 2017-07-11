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
    avatar: require('../assets/graphics/contributors/ben.jpg'),
    bio:
      "A full time Elixir developer at CargoSense, Ben is a co-author of the Absinthe GraphQL implementation for Elixir.",
    job: 'Developer @ Cargosense',
    link: 'https://twitter.com/benwilson512',
    name: 'Ben Wilson',
  },
  {
    avatar: require('../assets/graphics/contributors/bruce.jpg'),
    bio:
      "Bruce is a polyglot technologist, speaker, and Pragmatic Bookshelf author. He's the CTO of CargoSense, a logistics intelligence company built on Elixir and committed to its open source community.",
    job: 'CTO @ Cargosense',
    link: 'https://twitter.com/wbruce',
    name: 'Bruce Williams',
  },
]

export default keyBy(authors, 'name')
