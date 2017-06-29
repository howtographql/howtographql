export interface RelayConnection<T> {
  edges: Array<RelayEdge<T>>
}

interface RelayEdge<T> {
  node: T
}

export interface MarkdownRemark {
  html: string
  fields: {
    slug: string
  }
  frontmatter: {
    title: string
    videoId?: string
    question: string
    answers: string[]
    correctAnswer: number
    description?: string
  }
}

export interface Step {
  title: string
  link: string
  time?: number
  read?: boolean
  description?: string
}

export interface Stack {
  title: string
  key: string
  images: string[]
  content: {
    title: string
    description: string
  }
  type: StackType
}

type StackType = 'frontend' | 'backend'
