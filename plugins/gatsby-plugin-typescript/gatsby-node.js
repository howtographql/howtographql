'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require(`typescript`),
    transpileModule = _require.transpileModule;

var path = require(`path`);

var test = /\.tsx?$/;
var compilerDefaults = {
  target: `esnext`,
  experimentalDecorators: true,
  jsx: `preserve`
};

module.exports.resolvableExtensions = function () {
  return [`.ts`, `.tsx`];
};

module.exports.modifyWebpackConfig = function (_ref, _ref2) {
  var config = _ref.config;
  var compilerOptions = _ref2.compilerOptions;

  // CommonJS to keep Webpack happy.
  var copts = (0, _assign2.default)({}, compilerDefaults, compilerOptions, {
    module: `commonjs`
  });

  var tsConfig = {};

  try {
    var tsConfigPath = path.resolve(__dirname, '../../tsconfig.json');
    tsConfig = require(tsConfigPath);
  } catch (e) {
    console.error('no tsconfig found');
  }

  // React-land is rather undertyped; nontrivial TS projects will most likely
  // error (i.e., not build) at something or other.
  var opts = (0, _assign2.default)({}, { compilerOptions: copts, logLevel: 'warn' }, tsConfig);

  // Load gatsby babel plugin to extract graphql query
  var extractQueryPlugin = path.resolve(__dirname, `../../node_modules/gatsby/dist/utils/babel-plugin-extract-graphql.js`);

  config.loader(`typescript`, {
    test,
    loaders: [`babel?${(0, _stringify2.default)({ plugins: [extractQueryPlugin] })}`, `ts-loader?${(0, _stringify2.default)(opts)}`]
  });
};

module.exports.preprocessSource = function (_ref3, _ref4) {
  var contents = _ref3.contents,
      filename = _ref3.filename;
  var compilerOptions = _ref4.compilerOptions;

  // overwrite defaults with custom compiler options
  var copts = (0, _assign2.default)({}, compilerDefaults, compilerOptions, {
    target: `esnext`,
    module: `es6`
  });
  // return the transpiled source if it's TypeScript, otherwise null
  return test.test(filename) ? transpileModule(contents, { compilerOptions: copts }).outputText : null;
};