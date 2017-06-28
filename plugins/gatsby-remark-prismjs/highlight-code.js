"use strict";

var Prism = require("prismjs");
var _ = require("lodash");

module.exports = function (language, code) {
  var lineNumbersHighlight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  // (Try to) load languages on demand.
  if (!Prism.languages[language]) {
    try {
      require("prismjs/components/prism-" + language + ".js");
    } catch (e) {
      // Language wasn't loaded so let's bail.
      return code;
    }
  }

  var lang = Prism.languages[language];

  var highlightedCode = Prism.highlight(code, lang);
  if (lineNumbersHighlight) {
    var codeSplits = highlightedCode.split("\n").map(function (split, i) {
      if (_.includes(lineNumbersHighlight, i + 1)) {
        return {
          highlighted: true,
          code: "<span class=\"gatsby-highlight-code-line\">" + split + "\n</span>"
        };
      } else {
        return { code: split };
      }
    });

    highlightedCode = "";
    // Don't add a new line character after highlighted lines as they
    // need to be display: block and full-width.
    codeSplits.forEach(function (split) {
      split.highlighted ? highlightedCode += split.code : highlightedCode += split.code + "\n";
    });
  }

  return highlightedCode;
};