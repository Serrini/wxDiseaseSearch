'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var format = require('url').format;
var httpx = require('httpx');

var ua = require('./ua');
var Base = require('./base');

/**
 * API Gateway Simple client that use appcode
 */

var SimpleClient = function (_Base) {
  _inherits(SimpleClient, _Base);

  function SimpleClient(appcode) {
    _classCallCheck(this, SimpleClient);

    var _this = _possibleConstructorReturn(this, (SimpleClient.__proto__ || Object.getPrototypeOf(SimpleClient)).call(this));

    _this.appcode = appcode;
    return _this;
  }

  _createClass(SimpleClient, [{
    key: 'request',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(method, url, opts) {
        var options, response, headers, code, err, result, contentType;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = {
                  method: method,
                  headers: {
                    'authorization': 'APPCODE ' + this.appcode,
                    'user-agent': ua
                  },
                  data: opts.data,
                  beforeRequest: function beforeRequest(opts) {
                    // FIXME: 证书有问题
                    opts.rejectUnauthorized = false;
                    return opts;
                  },
                  timeout: opts.timeout
                };
                _context.next = 3;
                return httpx.request(url, options);

              case 3:
                response = _context.sent;
                headers = response.headers;
                code = response.statusCode;

                if (!(code < 200 || code >= 300)) {
                  _context.next = 11;
                  break;
                }

                err = new Error(`${method} '${format(url)}' failed width code(${code}).` + ` request id: ${headers['x-ca-request-id']},` + ` error message: ${headers['x-ca-error-message']}`);

                err.code = code;
                err.data = {
                  headers: response.headers
                };
                throw err;

              case 11:
                _context.next = 13;
                return httpx.read(response, 'utf8');

              case 13:
                result = _context.sent;
                contentType = response.headers['content-type'] || '';

                if (!contentType.includes('application/json')) {
                  _context.next = 25;
                  break;
                }

                _context.prev = 16;

                result = JSON.parse(result);
                _context.next = 25;
                break;

              case 20:
                _context.prev = 20;
                _context.t0 = _context['catch'](16);

                _context.t0.message = `${method} ${format(url)} failed. ` + _context.t0.message;
                _context.t0.data = result;
                throw _context.t0;

              case 25:
                return _context.abrupt('return', result);

              case 26:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[16, 20]]);
      }));

      function request(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return request;
    }()
  }]);

  return SimpleClient;
}(Base);

module.exports = SimpleClient;