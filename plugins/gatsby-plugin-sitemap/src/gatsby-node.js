import path from "path"
import sitemap from "sitemap"
import { defaultOptions, runQuery, writeFile } from "./internals"

const publicPath = `./public`

exports.onPostBuild = ({ graphql }, pluginOptions) => {
  delete pluginOptions.plugins

  const { query, serialize, output, ...rest } = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const map = sitemap.createSitemap(rest)
  return runQuery(graphql, query)
    .then(records => {
      const saved = path.join(publicPath, output)
      console.log('Saving file to', saved)

      serialize(records).forEach(u => map.add(u))
      return writeFile(saved, map.toString())
    })
}
