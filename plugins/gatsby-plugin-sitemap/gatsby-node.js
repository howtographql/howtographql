'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _sitemap = require('sitemap');

var _sitemap2 = _interopRequireDefault(_sitemap);

var _internals = require('./internals');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('babel-core/register');
require('babel-polyfill');


var publicPath = './public';

exports.onPostBuild = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref2, pluginOptions) {
    var graphql = _ref2.graphql;

    var _defaultOptions$plugi, query, serialize, output, rest, map, records, saved;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            delete pluginOptions.plugins;

            _defaultOptions$plugi = _extends({}, _internals.defaultOptions, pluginOptions), query = _defaultOptions$plugi.query, serialize = _defaultOptions$plugi.serialize, output = _defaultOptions$plugi.output, rest = _objectWithoutProperties(_defaultOptions$plugi, ['query', 'serialize', 'output']);
            map = _sitemap2.default.createSitemap(rest);
            _context.next = 5;
            return (0, _internals.runQuery)(graphql, query);

          case 5:
            records = _context.sent;
            saved = _path2.default.join(publicPath, output);

            console.log('Saving file to', saved);

            serialize(records).forEach(function (u) {
              return map.add(u);
            });
            _context.next = 11;
            return (0, _internals.writeFile)(saved, map.toString());

          case 11:
            return _context.abrupt('return', _context.sent);

          case 12:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();