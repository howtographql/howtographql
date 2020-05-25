/* tslint:disable */
import { Stack } from '../types'
const data: Stack[] = [
  {
    title: 'React + VulcanJS',
    type: 'frontend',
    key: 'react-vulcanjs',
    images: [
      require('../assets/icons/react.svg'),
      require('../assets/icons/vulcan.svg'),
    ],
    content: {
      title: 'React + Relay',
      description:
        "Get started with React and Facebook's homegrown GraphQL client Relay on the frontend",
    },
    authorName: 'Sacha Greif',
    comingSoon: true,
  },
  {
    title: 'Expo + Apollo',
    type: 'frontend',
    key: 'expo-apollo',
    images: [
      require('../assets/icons/expo.svg'),
      require('../assets/icons/apollo.svg'),
    ],
    content: {
      title: 'Expo + Apollo',
      description:
        "Get started with React and Facebook's homegrown GraphQL client Relay on the frontend",
    },
    authorName: 'Brent Vatne',
    comingSoon: true,
  },
//   {
//     title: 'Ember + Apollo',
//     type: 'frontend',
//     key: 'ember-apollo',
//     images: [
//       require('../assets/icons/ember.svg'),
//       require('../assets/icons/apollo.svg'),
//     ],
//     content: {
//       title: 'Ember + Apollo',
//       description:
//         "Learn how to get started with Ember.js and Apollo Client on the frontend",
//     },
//     authorName: 'Devan Beitel',
//   },
//   {
//     title: 'Angular + Apollo',
//     type: 'frontend',
//     key: 'angular-apollo',
//     images: [
//       require('../assets/icons/angular.svg'),
//       require('../assets/icons/apollo.svg'),
//     ],
//     content: {
//       title: 'Angular + Apollo',
//       description:
//         "Learn how to get started with Angular and Apollo Client on the frontend",
//     },
//     authorName: 'Boubacar Barry',
//   },
//   {
//     title: 'Vue + Apollo',
//     type: 'frontend',
//     key: 'vue-apollo',
//     images: [
//       require('../assets/icons/vue.svg'),
//       require('../assets/icons/apollo.svg'),
//     ],
//     content: {
//       title: 'Vue + Apollo',
//       description:
//         "Learn how to get started with VueJS and Apollo Client on the frontend",
//     },
//     authorName: 'Matt Dionis',
//   },
//   {
//     title: 'React + Relay',
//     type: 'frontend',
//     key: 'react-relay',
//     images: [
//       require('../assets/icons/react.svg'),
//       require('../assets/icons/relay.svg'),
//     ],
//     content: {
//       title: 'React + Relay',
//       description:
//         "Get started with React and Facebook's homegrown GraphQL client Relay on the frontend",
//     },
//     authorName: 'Nikolas Burk',
//   },
  {
    title: 'React + urql',
    type: 'frontend',
    key: 'react-urql',
    images: [
      require('../assets/icons/react.svg'),
      require('../assets/icons/urql.svg'),
    ],
    content: {
      title: 'React + urql',
      description:
        'Learn how to get started with React and urql on the frontend',
    },
    authorName: 'Jovi & Phil from Formidable',
    beginnersChoice: true,
  },
  {
    title: 'React + Apollo',
    type: 'frontend',
    key: 'react-apollo',
    images: [
      require('../assets/icons/react.svg'),
      require('../assets/icons/apollo.svg'),
    ],
    content: {
      title: 'React + Apollo',
      description:
        'Learn how to get started with React and Apollo Client on the frontend',
    },
    authorName: 'Nikolas Burk',
    beginnersChoice: true,
  },

  {
    title: 'graphql-node',
    type: 'backend',
    key: 'graphql-js',
    images: [
      require('../assets/icons/nodejs.svg'),
      require('../assets/icons/graphql.svg'),
    ],
    content: {
      title: 'graphql.js',
      description:
        'Build your own GraphQL server with Node.js, graphql-yoga and Prisma',
    },
    authorName: 'Maira Bello',
    beginnersChoice: true,
  },
  {
    title: 'graphql-elixir',
    type: 'backend',
    key: 'graphql-elixir',
    images: [
      require('../assets/icons/elixir.png'),
      require('../assets/icons/graphql-elixir.svg'),
    ],
    content: {
      title: 'graphql-elixir',
      description:
        'Get started with GraphQL and Elixir by building your own server in this tutorial',
    },
    authorName: 'Ben Wilson',
    color2: '#4e2a8e',
  },
  {
    title: 'graphql-ruby',
    type: 'backend',
    key: 'graphql-ruby',
    images: [
      require('../assets/icons/ruby.svg'),
      require('../assets/icons/graphql-ruby.svg'),
    ],
    content: {
      title: 'graphql-ruby',
      description: 'Learn how to build a GraphQL server with Ruby',
    },
    authorName: 'Radoslav Stankov',
    color2: '#a5152a',
  },
  {
    title: 'graphql-java',
    type: 'backend',
    key: 'graphql-java',
    images: [
      require('../assets/icons/java.svg'),
      require('../assets/icons/graphql.svg'),
    ],
    content: {
      title: 'graphql-java',
      description:
        'Build your own GraphQL server with the Java programming language',
    },
    authorName: 'Bojan Tomic',
  },
  {
    title: 'graphql-python',
    type: 'backend',
    key: 'graphql-python',
    images: [
      require('../assets/icons/python.svg'),
      require('../assets/icons/graphene.svg'),
    ],
    content: {
      title: 'graphql-python',
      description:
        'Learn how to build your own GraphQL server with Python and the Graphene framework',
    },
    authorName: 'Jonatas Baldin',
    color2: '#db594c',
  },
  {
    title: 'graphql-scala',
    type: 'backend',
    key: 'graphql-scala',
    images: [require('../assets/icons/sangria.svg')],
    content: {
      title: 'Graphql Scala',
      description:
        'Build your own GraphQL server with the Scala programming language',
    },
    authorName: 'Mariusz Nosiński',
    darkenGreyLogo: true,
  },
  {
    title: 'graphql-go',
    type: 'backend',
    key: 'graphql-go',
    images: [
      require('../assets/icons/gopher.svg'),
      require('../assets/icons/gqlgen.svg')
    ],
    content: {
      title: 'Graphql Go',
      description:
        'Learn how to build a GraphQL server with Go and Gqlgen',
    },
    authorName: 'Shayegan Hooshyari',
  }
]

export default data
