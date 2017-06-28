'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var rangeParser = require('parse-numeric-range');

module.exports = function (language) {
  if (!language) {
    return '';
  }

  var obj = {
    path: null,
    nocopy: false

    // removes the () part completly from the string, so the {} logic is untouched
  };if (language.split('(').length > 1) {
    var i0 = language.indexOf('(');
    var i1 = language.lastIndexOf(')');
    var params = language.slice(i0 + 1, i1);
    language = language.slice(0, i0) + language.slice(i1 + 1, language.length);

    var query = params.split('&').map(function (param) {
      return param.split('=');
    });

    query.forEach(function (q) {
      if (q[0] === 'path') {
        obj.path = q[1].replace(/"/g, '');
      }
      if (q[0] === 'nocopy') {
        obj.nocopy = true;
      }
    });
  }

  if (language.split('{').length > 1) {
    var _language$split = language.split('{'),
        _language$split2 = _slicedToArray(_language$split, 2),
        splitLanguage = _language$split2[0],
        rangeStr = _language$split2[1];

    rangeStr = rangeStr.slice(0, -1);
    return _extends({
      splitLanguage: splitLanguage,
      highlightLines: rangeParser.parse(rangeStr).filter(function (n) {
        return n > 0;
      })
    }, obj);
  }

  return _extends({ splitLanguage: language }, obj);
};

// ```js{1,2-10}(path="src/components/index.js"&nocopy)