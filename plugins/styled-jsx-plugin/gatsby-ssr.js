import flush from 'styled-jsx-postcss/server'

exports.onRenderBody = ({setHeadComponents}, pluginOptions) => {
  const css = flush()
  setHeadComponents([css])
}