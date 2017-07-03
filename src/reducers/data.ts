export interface DataState {
  personData: Array<{ [key: string]: any }>
  postData: Array<{ [key: string]: any }>
}

const defaultState = {
  personData: [],
  postData: [],
}

export default function dataReducer(state: DataState = defaultState, action) {
  switch (action.type) {
    case 'set person data':
      return {
        ...state,
        personData: action.payload,
      }
    case 'set post data':
      return {
        ...state,
        postData: action.payload,
      }
  }

  return state
}
