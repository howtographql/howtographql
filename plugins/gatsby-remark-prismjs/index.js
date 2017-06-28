'use strict';

var visit = require('unist-util-visit');

var parseLineNumberRange = require('./parse-line-number-range');
var highlightCode = require('./highlight-code');

module.exports = function (_ref) {
  var markdownAST = _ref.markdownAST;

  visit(markdownAST, 'code', function (node) {
    var language = node.lang;

    var _parseLineNumberRange = parseLineNumberRange(language),
        splitLanguage = _parseLineNumberRange.splitLanguage,
        highlightLines = _parseLineNumberRange.highlightLines,
        path = _parseLineNumberRange.path;

    language = splitLanguage;

    // PrismJS's theme styles are targeting pre[class*="language-"]
    // to apply its styles. We do the same here so that users
    // can apply a PrismJS theme and get the expected, ready-to-use
    // outcome without any additional CSS.
    //
    // @see https://github.com/PrismJS/prism/blob/1d5047df37aacc900f8270b1c6215028f6988eb1/themes/prism.css#L49-L54
    var preCssClassLanguage = 'none';
    if (language) {
      language = language.toLowerCase();
      preCssClassLanguage = language;
    }

    // Replace the node with the markup we need to make
    // 100% width highlighted code lines work
    var pathString = path ? ' path="' + path + '"' : '';
    node.type = 'html';
    node.value = '<div class="gatsby-highlight">\n      <pre class="language-' + preCssClassLanguage + '" ' + pathString + '><code>' + highlightCode(language, node.value, highlightLines) + '</code></pre>\n      </div>';
  });
};