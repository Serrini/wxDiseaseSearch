'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('url'),
    parse = _require.parse,
    format = _require.format;

var crypto = require('crypto');

var uuid = require('uuid');
var httpx = require('httpx');
var debug = require('debug')('api-gateway');

var ua = require('./ua');
var Base = require('./base');

var form = 'application/x-www-form-urlencoded';
var hasOwnProperty = function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * API Gateway Client
 */

var Client = function (_Base) {
  _inherits(Client, _Base);

  function Client(key, secret) {
    var stage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'RELEASE';

    _classCallCheck(this, Client);

    var _this = _possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this));

    _this.appKey = key;
    _this.appSecret = Buffer.from(secret, 'utf8');
    _this.stage = stage;
    return _this;
  }

  _createClass(Client, [{
    key: 'buildStringToSign',
    value: function buildStringToSign(method, headers, signedHeadersStr, url, data) {
      // accept, contentMD5, contentType,
      var lf = '\n';
      var list = [method, lf];

      var accept = headers['accept'];
      if (accept) {
        list.push(accept);
      }
      list.push(lf);

      var contentMD5 = headers['content-md5'];
      if (contentMD5) {
        list.push(contentMD5);
      }
      list.push(lf);

      var contentType = headers['content-type'] || '';
      if (contentType) {
        list.push(contentType);
      }
      list.push(lf);

      var date = headers['date'];
      if (date) {
        list.push(date);
      }
      list.push(lf);

      if (signedHeadersStr) {
        list.push(signedHeadersStr);
        list.push(lf);
      }

      if (contentType.startsWith(form)) {
        list.push(this.buildUrl(url, data));
      } else {
        list.push(this.buildUrl(url));
      }

      return list.join('');
    }
  }, {
    key: 'sign',
    value: function sign(stringToSign) {
      return crypto.createHmac('sha256', this.appSecret).update(stringToSign, 'utf8').digest('base64');
    }
  }, {
    key: 'md5',
    value: function md5(content) {
      return crypto.createHash('md5').update(content, 'utf8').digest('base64');
    }
  }, {
    key: 'getSignHeaderKeys',
    value: function getSignHeaderKeys(headers, signHeaders) {
      var keys = Object.keys(headers).sort();
      var signKeys = [];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        // x-ca- 开头的header或者指定的header
        if (key.startsWith('x-ca-') || hasOwnProperty(signHeaders, key)) {
          signKeys.push(key);
        }
      }

      // 按字典序排序
      return signKeys.sort();
    }
  }, {
    key: 'buildUrl',
    value: function buildUrl(parsedUrl, data) {
      var toStringify = Object.assign(parsedUrl.query, data);
      var result = parsedUrl.pathname;
      if (Object.keys(toStringify).length) {
        var keys = Object.keys(toStringify).sort();
        var list = new Array(keys.length);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (toStringify[key] !== undefined && toStringify[key] !== null && '' + toStringify[key]) {
            list[i] = `${key}=${toStringify[key]}`;
          } else {
            list[i] = `${key}`;
          }
        }
        result += '?' + list.join('&');
      }
      return result;
    }
  }, {
    key: 'buildHeaders',
    value: function buildHeaders() {
      var headers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var signHeaders = arguments[1];

      return Object.assign({
        'x-ca-timestamp': Date.now(),
        'x-ca-key': this.appKey,
        'x-ca-nonce': uuid.v4(),
        'x-ca-stage': this.stage,
        'accept': 'application/json'
      }, headers, signHeaders);
    }
  }, {
    key: 'getSignedHeadersString',
    value: function getSignedHeadersString(signHeaders, headers) {
      var list = [];
      for (var i = 0; i < signHeaders.length; i++) {
        var key = signHeaders[i];
        list.push(key + ':' + headers[key]);
      }

      return list.join('\n');
    }
  }, {
    key: 'request',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(method, url, opts, originData) {
        var signHeaders, headers, requestContentType, signHeaderKeys, signedHeadersStr, parsedUrl, stringToSign, response, code, message, err, serverStringToSign, result, contentType;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                signHeaders = opts.signHeaders;
                // 小写化，合并之后的headers

                headers = this.buildHeaders(opts.headers, signHeaders);
                requestContentType = headers['content-type'] || '';

                if (method === 'POST' && !requestContentType.startsWith(form)) {
                  headers['content-md5'] = this.md5(opts.data);
                }

                signHeaderKeys = this.getSignHeaderKeys(headers, signHeaders);

                headers['x-ca-signature-headers'] = signHeaderKeys.join(',');
                signedHeadersStr = this.getSignedHeadersString(signHeaderKeys, headers);
                parsedUrl = parse(url, true);
                stringToSign = this.buildStringToSign(method, headers, signedHeadersStr, parsedUrl, originData);

                headers['x-ca-signature'] = this.sign(stringToSign);
                headers['user-agent'] = ua;

                if (debug.enabled) {
                  debug('post body:');
                  debug('%s', opts.data);
                }

                _context.next = 14;
                return httpx.request(parsedUrl, {
                  method: method,
                  headers: headers,
                  data: opts.data,
                  beforeRequest: function beforeRequest(opts) {
                    // FIXME: 证书有问题
                    opts.rejectUnauthorized = false;
                    return opts;
                  },
                  timeout: opts.timeout
                });

              case 14:
                response = _context.sent;
                code = response.statusCode;

                if (!(code < 200 || code >= 300)) {
                  _context.next = 23;
                  break;
                }

                message = response.headers['x-ca-error-message'] || '';
                err = new Error(`${method} ${format(url)} failed width code(${code}).` + ` request id: ${response.headers['x-ca-request-id']},` + ` error message: ${message}`);

                if (debug.enabled) {
                  debug('stringToSign:');
                  debug('client: %s', stringToSign.replace(/\n/g, '#'));
                  if (message.includes('Invalid Signature')) {
                    serverStringToSign = message.replace('Invalid Signature, Server StringToSign:', '');

                    debug('server: %s', serverStringToSign);
                  }
                }
                err.code = code;
                err.data = {
                  headers: response.headers
                };
                throw err;

              case 23:
                _context.next = 25;
                return httpx.read(response, 'utf8');

              case 25:
                result = _context.sent;
                contentType = response.headers['content-type'] || '';

                if (contentType.startsWith('application/json')) {
                  result = JSON.parse(result);
                }
                return _context.abrupt('return', result);

              case 29:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function request(_x3, _x4, _x5, _x6) {
        return _ref.apply(this, arguments);
      }

      return request;
    }()
  }]);

  return Client;
}(Base);

module.exports = Client;