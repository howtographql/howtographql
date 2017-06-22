exports.onRenderBody = ({setHeadComponents}, pluginOptions) => {
  if (process.env.NODE_ENV === `production`) {
    const flush = require('styled-jsx-postcss/server')
    const css = flush()
    setHeadComponents([css])
  }
}
