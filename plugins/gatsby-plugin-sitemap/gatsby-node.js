"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _sitemap = require("sitemap");

var _sitemap2 = _interopRequireDefault(_sitemap);

var _internals = require("./internals");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var publicPath = "./public";

exports.onPostBuild = function (_ref, pluginOptions) {
  var graphql = _ref.graphql;

  delete pluginOptions.plugins;

  var _defaultOptions$plugi = _extends({}, _internals.defaultOptions, pluginOptions),
      query = _defaultOptions$plugi.query,
      serialize = _defaultOptions$plugi.serialize,
      output = _defaultOptions$plugi.output,
      rest = _objectWithoutProperties(_defaultOptions$plugi, ["query", "serialize", "output"]);

  var map = _sitemap2.default.createSitemap(rest);
  return (0, _internals.runQuery)(graphql, query).then(function (records) {
    var saved = _path2.default.join(publicPath, output);
    console.log('Saving file to', saved);

    serialize(records).forEach(function (u) {
      return map.add(u);
    });
    return (0, _internals.writeFile)(saved, map.toString());
  });
};