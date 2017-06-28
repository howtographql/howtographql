const rangeParser = require(`parse-numeric-range`)

module.exports = language => {
  if (!language) {
    return ``
  }

  let obj = {
    path: null,
    nocopy: false,
  }

  // removes the () part completly from the string, so the {} logic is untouched
  if (language.split(`(`).length > 1) {
    const i0 = language.indexOf('(')
    const i1 = language.lastIndexOf(')')
    const params = language.slice(i0 + 1, i1)
    language = language.slice(0, i0) + language.slice(i1 + 1, language.length)

    const query = params.split('&').map(param => param.split('='))

    query.forEach(q => {
      if (q[0] === 'path') {
        obj.path = q[1].replace(/"/g, '')
      }
      if (q[0] === 'nocopy') {
        obj.nocopy = true
      }
    })
  }

  if (language.split(`{`).length > 1) {
    let [splitLanguage, rangeStr] = language.split(`{`)
    rangeStr = rangeStr.slice(0, -1)
    return {
      splitLanguage,
      highlightLines: rangeParser.parse(rangeStr).filter(n => n > 0),
      ...obj,
    }
  }

  return { splitLanguage: language, ...obj }
}

// ```js{1,2-10}(path="src/components/index.js"&nocopy)