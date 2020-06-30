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
      "Nikolas is a developer and head of content at Prisma. He is excited about GraphQL as a new API technology and has a passion for learning and sharing knowledge.",
    job: 'Developer @ Prisma',
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
  {
    avatar: require('../assets/graphics/contributors/ben.jpg'),
    bio: "A full time Elixir developer at CargoSense, Ben is a co-author of the Absinthe GraphQL implementation for Elixir.",
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
  {
    avatar: require('../assets/graphics/contributors/marcandre.jpg'),
    bio:
      "A Jazz guitarist turned developer, Marc-André is currently working at Shopify, trying to make commerce better for everyone. When he's not hacking on Rails, GraphQL or Relay, he likes lifting heavy barbells above his head.",
    link: 'http://mgiroux.me',
    job: 'Senior Developer @ Shopify',
    name: 'Marc-Andre Giroux'
  },
  {
    avatar: require('../assets/graphics/contributors/jonatas.jpg'),
    bio: "Software Developer, speaker, contributor and conferences organizer. Loves open source communities.",
    link: 'https://twitter.com/jonatasbaldin',
    job: 'Software Developer',
    name: 'Jonatas Baldin'
  },
  {
    avatar: require('../assets/graphics/contributors/matt.jpg'),
    bio:
      "Matt is a full-stack JavaScript engineer who spends most of his time on GraphQL, VueJS, and D3js projects. He also dabbles in powerlifting and is known to have a weakness for chihuahuas.",
    link: 'https://twitter.com/mattdionis',
    job: 'Software Engineer @ Circle',
    name: 'Matt Dionis'
  },
  {
    avatar: require('../assets/graphics/contributors/devan.jpg'),
    bio:
      "Devan is a full-stack JavaScript engineer who enjoys working with a myriad of tech including GraphQL, Ember, React, and VueJS. He has a passion for helping others through documentation and tutorials, and can often be found at Walt Disney World.",
    link: 'https://twitter.com/devanbeitel_',
    job: 'Engineer @ Envy Labs',
    name: 'Devan Beitel'
  },
  {
    avatar: require('../assets/graphics/contributors/bouba.jpg'),
    bio:
      "Bouba is Open Source Engineer who's passionate about new technologies. He spends most of his time on GraphQL, Angular, React, Vue.js, …",
    link: 'https://twitter.com/b_b4rry',
    job: 'Open Source Engineer @ Hackages',
    name: 'Boubacar Barry'
  },
  {
    avatar: require('../assets/graphics/contributors/marioosh.jpg'),
    bio:
      "Experienced Scala Developer who enjoys learning and using many other techs. Years ago fell in love in Graph Databases now sharing this emotion with GraphQL.",
    link: 'https://twitter.com/marioosh',
    job: 'Fullstack Developer @ Scalac.io',
    name: 'Mariusz Nosiński'
  },
  {
    avatar: require('../assets/graphics/contributors/phil-and-jovi.jpg'),
    bio:
      "Phil is working in London and Jovi is working remotely from Belgium for Formidable. They're core contributors on the urql project. Jovi also works on the Preact core team while Phil is on the styled-components core team.",
    link: 'https://formidable.com/',
    job: 'Open Source @ Formidable',
    name: 'Jovi & Phil from Formidable'
  },
  {
    avatar: require('../assets/graphics/contributors/robin.png'),
    bio:
      "Robin is a full-stack software engineer and budding data scientist who also loves learning foreign (human) languages. He is a co-founder @ Journaly.io, runs a language learning YouTube channel, and works at StyleSeat in San Francisco.",
    link: 'https://www.youtube.com/user/TheLifeOfRob/',
    job: 'Software Engineer @ StyleSeat // CEO @ Journaly',
    name: 'Robin MacPherson'
  },
]

export default keyBy(authors, 'name')
