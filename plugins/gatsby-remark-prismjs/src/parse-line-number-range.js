const rangeParser = require(`parse-numeric-range`)

module.exports = language => {
  if (!language) {
    return ``
  }
  let path = null

  // removes the () part completly from the string, so the {} logic is untouched
  if (language.split(`(`).length > 1) {
    const i0 = language.indexOf('(')
    const i1 = language.lastIndexOf(')')
    const params = language.slice(i0 + 1, i1)
    language = language.slice(0, i0) + language.slice(i1 + 1, language.length)

    path = params.split('=')[1].replace(/"/g, '')
  }

  if (language.split(`{`).length > 1) {
    let [splitLanguage, rangeStr] = language.split(`{`)
    rangeStr = rangeStr.slice(0, -1)
    return {
      splitLanguage,
      highlightLines: rangeParser.parse(rangeStr).filter(n => n > 0),
      path,
    }
  }

  return { splitLanguage: language, path }
}

// ```js{1,2-10}(path="src/components/index.js")