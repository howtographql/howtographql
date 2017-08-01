"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultOptions = exports.runQuery = exports.writeFile = undefined;

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _pify = require("pify");

var _pify2 = _interopRequireDefault(_pify);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var writeFile = exports.writeFile = (0, _pify2.default)(_fs2.default.writeFile);

var runQuery = exports.runQuery = function runQuery(handler, query) {
  return handler(query).then(function (r) {
    if (r.errors) {
      console.error(r.errors);
      console.error(_util2.default.inspect(r.errors, { showHidden: true, depth: null }));
      throw new Error(r.errors.join(", "));
    }

    return r.data;
  });
};

var defaultOptions = exports.defaultOptions = {
  query: "\n    {\n      site {\n        siteMetadata {\n          siteUrl\n        }\n      }\n      \n      allSitePage(\n        filter: {\n          path: {ne: \"/dev-404-page/\"}\n        }\n      ) {\n        edges {\n          node {\n            path\n          }\n        }\n      }\n  }",
  output: "/sitemap.xml",
  serialize: function serialize(_ref) {
    var site = _ref.site,
        allSitePage = _ref.allSitePage;
    return allSitePage.edges.map(function (edge) {
      return {
        url: site.siteMetadata.siteUrl + edge.node.path,
        changefreq: "daily",
        priority: 0.7
      };
    });
  }
};