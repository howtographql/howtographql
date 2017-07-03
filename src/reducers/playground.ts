export interface PlaygroundState {
  endpoint: string | null
  executionCount: number
}

const defaultState = {
  endpoint: null,
  executionCount: 0,
}

export default function playgroundReducer(
  state: PlaygroundState = defaultState,
  action,
) {
  switch (action.type) {
    case 'set endpoint':
      return {
        ...state,
        endpoint: action.payload,
      }
    case 'increase execution count':
      return {
        ...state,
        executionCount: state.executionCount + 1,
      }
  }

  return state
}
