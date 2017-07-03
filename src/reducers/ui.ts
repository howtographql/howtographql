interface UIState {
  overlayVisible: boolean
  searchVisible: boolean
  overviewVideoVisible: boolean
}

const defaultState: UIState = {
  overlayVisible: false,
  overviewVideoVisible: false,
  searchVisible: false,
}

export default function uiReducer(state = defaultState, action) {
  switch (action.type) {
    case 'set search visible':
      return {
        ...state,
        overlayVisible: action.payload,
        searchVisible: action.payload,
      }
    case 'hide overlay':
      return {
        overlayVisible: false,
        overviewVideoVisible: false,
        searchVisible: false,
      }
    case 'set overview video visible':
      return {
        ...state,
        overlayVisible: action.payload,
        overviewVideoVisible: action.payload,
      }
  }

  return state
}
