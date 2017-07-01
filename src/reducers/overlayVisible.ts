export default function overlayVisibleReducer(state = false, action) {
  if (action && action.type === 'set overlay visible') {
    return Boolean(action.payload)
  }
  return state
}
