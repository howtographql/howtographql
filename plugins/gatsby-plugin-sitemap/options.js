"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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