export interface PlaygroundState {
  endpoint: string | null
}

const defaultState = {
  endpoint: null,
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
  }

  return state
}
