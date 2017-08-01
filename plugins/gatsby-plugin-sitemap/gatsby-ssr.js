"use strict";

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.onRenderBody = function (_ref, pluginOptions) {
  var setHeadComponents = _ref.setHeadComponents;


  setHeadComponents([_react2.default.createElement("link", {
    key: "gatsby-plugin-sitemap",
    rel: "sitemap",
    type: "application/xml",
    href: "/sitemap.xml"
  })]);
};