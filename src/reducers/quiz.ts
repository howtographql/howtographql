export interface QuizState {
  rememberSkipped: boolean
  quizReactions: { [path: string]: QuizReaction }
}

export interface QuizReaction {
  answerIndeces?: number[]
  skipped?: boolean
  answeredCorrectly?: boolean
}

export const defaultQuizState: QuizState = {
  quizReactions: {},
  rememberSkipped: false,
}

export interface Action {
  type: string
  path?: string
  payload?: any
}

export const defaultReaction: QuizReaction = {
  answerIndeces: [],
  answeredCorrectly: false,
  skipped: false,
}

export default function quizReducer(
  state: QuizState = defaultQuizState,
  action: Action,
): QuizState {
  switch (action.type) {
    case 'remember skipped':
      return {
        ...state,
        rememberSkipped: action.payload,
      }

    case 'answer correctly':
      return updateReaction(state, action.path, { answeredCorrectly: true })

    case 'add answer':
      const currentReaction = action.path
        ? state.quizReactions[action.path] || defaultReaction
        : defaultReaction
      return updateReaction(state, action.path, {
        answerIndeces: (currentReaction.answerIndeces || [])
          .concat(action.payload),
      })

    case 'skip':
      return updateReaction(state, action.path, { skipped: true })

    case 'set reaction':
      return updateReaction(state, action.path, action.payload)
  }
  return state
}

function updateReaction(
  state: QuizState,
  path?: string,
  newReaction?: QuizReaction,
) {
  if (!path) {
    throw new Error('path is missing')
    // return state
  }
  const oldReaction = state.quizReactions[path] || defaultReaction
  return {
    ...state,
    quizReactions: {
      ...state.quizReactions,
      [path]: {
        ...oldReaction,
        ...newReaction,
      },
    },
  }
}
