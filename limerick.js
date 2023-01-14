// Note: to run, this extension needs an OpenAI API key. Insert yours inside the single-quotes on line 48.
// My code is lines 52-138` – the rest is from the OpenAI API, bundled with browserify.

(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = 'MODULE_NOT_FOUND'), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = 'function' == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function (require, module, exports) {
        const { Configuration, OpenAIApi } = require('openai');

        const configuration = new Configuration({
          apiKey: '',
        });
        const openai = new OpenAIApi(configuration);

        // while loops don't work!!! not clear why.
        function limerickTrimmer(limerick) {
          if (limerick.includes('\n\n')) {
            limerick.replaceAll('\n\n', '\n');
          }
          if (limerick.includes('\n\n')) {
            limerick.replaceAll('\n\n', '\n');
          }
          if (limerick.includes('\n\n')) {
            limerick.replaceAll('\n\n', '\n');
          }
          if (limerick[0] === '\n') {
            limerick = limerick.substring(1);
          }
          if (limerick[0] === '\n') {
            limerick = limerick.substring(1);
          }
          if (limerick[0] === '\n') {
            limerick = limerick.substring(1);
          }
          return limerick;
        }

        let url = window.location.href;

        if (url.includes('bbc')) {
          //get all subheds
          let subheds = document.getElementsByClassName('media__summary');

          const bbcLimerickMaker = async (subhed) => {
            console.log(subhed);
            // grab headline
            let text = subhed.parentNode.innerText;
            // bbc: get rid of category tag
            let lastBreak = text.lastIndexOf('\n');
            text = text.substring(0, lastBreak);
            // get a limerick
            const response = await openai.createCompletion({
              model: 'text-davinci-003',
              prompt: `Write a limerick based on this news story:\n${text}`,
              temperature: 0,
              max_tokens: 500,
              top_p: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
            });
            // replace subhed with limerick
            subhed.innerText = limerickTrimmer(response.data.choices[0].text);
          };

          // replace all subheds with limericks
          for (let i = 0; i < subheds.length; i++) {
            bbcLimerickMaker(subheds[i]);
          }
        }

        if (url.includes('npr')) {
          // get all subheds
          let subheds = document.getElementsByClassName('teaser');

          const nprLimerickMaker = async (subhed) => {
            console.log(subhed.parentNode.parentNode.innerText);
            // grab headline
            let text = subhed.parentNode.parentNode.innerText;
            // npr: get rid of category tag
            let sectionBreak = text.indexOf('\n');
            text = text.substring(sectionBreak + 1);
            console.log(text);
            // get a limerick
            const response = await openai.createCompletion({
              model: 'text-davinci-003',
              prompt: `Write a limerick based on this news story:\n${text}`,
              temperature: 0,
              max_tokens: 500,
              top_p: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
            });
            // replace subhed with limerick
            subhed.innerText = limerickTrimmer(response.data.choices[0].text);
          };

          // replace all subheds with limericks
          for (let i = 0; i < subheds.length; i++) {
            nprLimerickMaker(subheds[i]);
          }
        }
      },
      { openai: 37 },
    ],
    2: [
      function (require, module, exports) {
        module.exports = require('./lib/axios');
      },
      { './lib/axios': 4 },
    ],
    3: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');
        var settle = require('./../core/settle');
        var cookies = require('./../helpers/cookies');
        var buildURL = require('./../helpers/buildURL');
        var buildFullPath = require('../core/buildFullPath');
        var parseHeaders = require('./../helpers/parseHeaders');
        var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
        var createError = require('../core/createError');
        var transitionalDefaults = require('../defaults/transitional');
        var Cancel = require('../cancel/Cancel');

        module.exports = function xhrAdapter(config) {
          return new Promise(function dispatchXhrRequest(resolve, reject) {
            var requestData = config.data;
            var requestHeaders = config.headers;
            var responseType = config.responseType;
            var onCanceled;
            function done() {
              if (config.cancelToken) {
                config.cancelToken.unsubscribe(onCanceled);
              }

              if (config.signal) {
                config.signal.removeEventListener('abort', onCanceled);
              }
            }

            if (utils.isFormData(requestData)) {
              delete requestHeaders['Content-Type']; // Let the browser set it
            }

            var request = new XMLHttpRequest();

            // HTTP basic authentication
            if (config.auth) {
              var username = config.auth.username || '';
              var password = config.auth.password
                ? unescape(encodeURIComponent(config.auth.password))
                : '';
              requestHeaders.Authorization =
                'Basic ' + btoa(username + ':' + password);
            }

            var fullPath = buildFullPath(config.baseURL, config.url);
            request.open(
              config.method.toUpperCase(),
              buildURL(fullPath, config.params, config.paramsSerializer),
              true
            );

            // Set the request timeout in MS
            request.timeout = config.timeout;

            function onloadend() {
              if (!request) {
                return;
              }
              // Prepare the response
              var responseHeaders =
                'getAllResponseHeaders' in request
                  ? parseHeaders(request.getAllResponseHeaders())
                  : null;
              var responseData =
                !responseType ||
                responseType === 'text' ||
                responseType === 'json'
                  ? request.responseText
                  : request.response;
              var response = {
                data: responseData,
                status: request.status,
                statusText: request.statusText,
                headers: responseHeaders,
                config: config,
                request: request,
              };

              settle(
                function _resolve(value) {
                  resolve(value);
                  done();
                },
                function _reject(err) {
                  reject(err);
                  done();
                },
                response
              );

              // Clean up request
              request = null;
            }

            if ('onloadend' in request) {
              // Use onloadend if available
              request.onloadend = onloadend;
            } else {
              // Listen for ready state to emulate onloadend
              request.onreadystatechange = function handleLoad() {
                if (!request || request.readyState !== 4) {
                  return;
                }

                // The request errored out and we didn't get a response, this will be
                // handled by onerror instead
                // With one exception: request that using file: protocol, most browsers
                // will return status as 0 even though it's a successful request
                if (
                  request.status === 0 &&
                  !(
                    request.responseURL &&
                    request.responseURL.indexOf('file:') === 0
                  )
                ) {
                  return;
                }
                // readystate handler is calling before onerror or ontimeout handlers,
                // so we should call onloadend on the next 'tick'
                setTimeout(onloadend);
              };
            }

            // Handle browser request cancellation (as opposed to a manual cancellation)
            request.onabort = function handleAbort() {
              if (!request) {
                return;
              }

              reject(
                createError('Request aborted', config, 'ECONNABORTED', request)
              );

              // Clean up request
              request = null;
            };

            // Handle low level network errors
            request.onerror = function handleError() {
              // Real errors are hidden from us by the browser
              // onerror should only fire if it's a network error
              reject(createError('Network Error', config, null, request));

              // Clean up request
              request = null;
            };

            // Handle timeout
            request.ontimeout = function handleTimeout() {
              var timeoutErrorMessage = config.timeout
                ? 'timeout of ' + config.timeout + 'ms exceeded'
                : 'timeout exceeded';
              var transitional = config.transitional || transitionalDefaults;
              if (config.timeoutErrorMessage) {
                timeoutErrorMessage = config.timeoutErrorMessage;
              }
              reject(
                createError(
                  timeoutErrorMessage,
                  config,
                  transitional.clarifyTimeoutError
                    ? 'ETIMEDOUT'
                    : 'ECONNABORTED',
                  request
                )
              );

              // Clean up request
              request = null;
            };

            // Add xsrf header
            // This is only done if running in a standard browser environment.
            // Specifically not if we're in a web worker, or react-native.
            if (utils.isStandardBrowserEnv()) {
              // Add xsrf header
              var xsrfValue =
                (config.withCredentials || isURLSameOrigin(fullPath)) &&
                config.xsrfCookieName
                  ? cookies.read(config.xsrfCookieName)
                  : undefined;

              if (xsrfValue) {
                requestHeaders[config.xsrfHeaderName] = xsrfValue;
              }
            }

            // Add headers to the request
            if ('setRequestHeader' in request) {
              utils.forEach(
                requestHeaders,
                function setRequestHeader(val, key) {
                  if (
                    typeof requestData === 'undefined' &&
                    key.toLowerCase() === 'content-type'
                  ) {
                    // Remove Content-Type if data is undefined
                    delete requestHeaders[key];
                  } else {
                    // Otherwise add header to the request
                    request.setRequestHeader(key, val);
                  }
                }
              );
            }

            // Add withCredentials to request if needed
            if (!utils.isUndefined(config.withCredentials)) {
              request.withCredentials = !!config.withCredentials;
            }

            // Add responseType to request if needed
            if (responseType && responseType !== 'json') {
              request.responseType = config.responseType;
            }

            // Handle progress if needed
            if (typeof config.onDownloadProgress === 'function') {
              request.addEventListener('progress', config.onDownloadProgress);
            }

            // Not all browsers support upload events
            if (
              typeof config.onUploadProgress === 'function' &&
              request.upload
            ) {
              request.upload.addEventListener(
                'progress',
                config.onUploadProgress
              );
            }

            if (config.cancelToken || config.signal) {
              // Handle cancellation
              // eslint-disable-next-line func-names
              onCanceled = function (cancel) {
                if (!request) {
                  return;
                }
                reject(
                  !cancel || (cancel && cancel.type)
                    ? new Cancel('canceled')
                    : cancel
                );
                request.abort();
                request = null;
              };

              config.cancelToken && config.cancelToken.subscribe(onCanceled);
              if (config.signal) {
                config.signal.aborted
                  ? onCanceled()
                  : config.signal.addEventListener('abort', onCanceled);
              }
            }

            if (!requestData) {
              requestData = null;
            }

            // Send the request
            request.send(requestData);
          });
        };
      },
      {
        '../cancel/Cancel': 5,
        '../core/buildFullPath': 10,
        '../core/createError': 11,
        '../defaults/transitional': 18,
        './../core/settle': 15,
        './../helpers/buildURL': 21,
        './../helpers/cookies': 23,
        './../helpers/isURLSameOrigin': 26,
        './../helpers/parseHeaders': 28,
        './../utils': 31,
      },
    ],
    4: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./utils');
        var bind = require('./helpers/bind');
        var Axios = require('./core/Axios');
        var mergeConfig = require('./core/mergeConfig');
        var defaults = require('./defaults');

        /**
         * Create an instance of Axios
         *
         * @param {Object} defaultConfig The default config for the instance
         * @return {Axios} A new instance of Axios
         */
        function createInstance(defaultConfig) {
          var context = new Axios(defaultConfig);
          var instance = bind(Axios.prototype.request, context);

          // Copy axios.prototype to instance
          utils.extend(instance, Axios.prototype, context);

          // Copy context to instance
          utils.extend(instance, context);

          // Factory for creating new instances
          instance.create = function create(instanceConfig) {
            return createInstance(mergeConfig(defaultConfig, instanceConfig));
          };

          return instance;
        }

        // Create the default instance to be exported
        var axios = createInstance(defaults);

        // Expose Axios class to allow class inheritance
        axios.Axios = Axios;

        // Expose Cancel & CancelToken
        axios.Cancel = require('./cancel/Cancel');
        axios.CancelToken = require('./cancel/CancelToken');
        axios.isCancel = require('./cancel/isCancel');
        axios.VERSION = require('./env/data').version;

        // Expose all/spread
        axios.all = function all(promises) {
          return Promise.all(promises);
        };
        axios.spread = require('./helpers/spread');

        // Expose isAxiosError
        axios.isAxiosError = require('./helpers/isAxiosError');

        module.exports = axios;

        // Allow use of default import syntax in TypeScript
        module.exports.default = axios;
      },
      {
        './cancel/Cancel': 5,
        './cancel/CancelToken': 6,
        './cancel/isCancel': 7,
        './core/Axios': 8,
        './core/mergeConfig': 14,
        './defaults': 17,
        './env/data': 19,
        './helpers/bind': 20,
        './helpers/isAxiosError': 25,
        './helpers/spread': 29,
        './utils': 31,
      },
    ],
    5: [
      function (require, module, exports) {
        'use strict';

        /**
         * A `Cancel` is an object that is thrown when an operation is canceled.
         *
         * @class
         * @param {string=} message The message.
         */
        function Cancel(message) {
          this.message = message;
        }

        Cancel.prototype.toString = function toString() {
          return 'Cancel' + (this.message ? ': ' + this.message : '');
        };

        Cancel.prototype.__CANCEL__ = true;

        module.exports = Cancel;
      },
      {},
    ],
    6: [
      function (require, module, exports) {
        'use strict';

        var Cancel = require('./Cancel');

        /**
         * A `CancelToken` is an object that can be used to request cancellation of an operation.
         *
         * @class
         * @param {Function} executor The executor function.
         */
        function CancelToken(executor) {
          if (typeof executor !== 'function') {
            throw new TypeError('executor must be a function.');
          }

          var resolvePromise;

          this.promise = new Promise(function promiseExecutor(resolve) {
            resolvePromise = resolve;
          });

          var token = this;

          // eslint-disable-next-line func-names
          this.promise.then(function (cancel) {
            if (!token._listeners) return;

            var i;
            var l = token._listeners.length;

            for (i = 0; i < l; i++) {
              token._listeners[i](cancel);
            }
            token._listeners = null;
          });

          // eslint-disable-next-line func-names
          this.promise.then = function (onfulfilled) {
            var _resolve;
            // eslint-disable-next-line func-names
            var promise = new Promise(function (resolve) {
              token.subscribe(resolve);
              _resolve = resolve;
            }).then(onfulfilled);

            promise.cancel = function reject() {
              token.unsubscribe(_resolve);
            };

            return promise;
          };

          executor(function cancel(message) {
            if (token.reason) {
              // Cancellation has already been requested
              return;
            }

            token.reason = new Cancel(message);
            resolvePromise(token.reason);
          });
        }

        /**
         * Throws a `Cancel` if cancellation has been requested.
         */
        CancelToken.prototype.throwIfRequested = function throwIfRequested() {
          if (this.reason) {
            throw this.reason;
          }
        };

        /**
         * Subscribe to the cancel signal
         */

        CancelToken.prototype.subscribe = function subscribe(listener) {
          if (this.reason) {
            listener(this.reason);
            return;
          }

          if (this._listeners) {
            this._listeners.push(listener);
          } else {
            this._listeners = [listener];
          }
        };

        /**
         * Unsubscribe from the cancel signal
         */

        CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
          if (!this._listeners) {
            return;
          }
          var index = this._listeners.indexOf(listener);
          if (index !== -1) {
            this._listeners.splice(index, 1);
          }
        };

        /**
         * Returns an object that contains a new `CancelToken` and a function that, when called,
         * cancels the `CancelToken`.
         */
        CancelToken.source = function source() {
          var cancel;
          var token = new CancelToken(function executor(c) {
            cancel = c;
          });
          return {
            token: token,
            cancel: cancel,
          };
        };

        module.exports = CancelToken;
      },
      { './Cancel': 5 },
    ],
    7: [
      function (require, module, exports) {
        'use strict';

        module.exports = function isCancel(value) {
          return !!(value && value.__CANCEL__);
        };
      },
      {},
    ],
    8: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');
        var buildURL = require('../helpers/buildURL');
        var InterceptorManager = require('./InterceptorManager');
        var dispatchRequest = require('./dispatchRequest');
        var mergeConfig = require('./mergeConfig');
        var validator = require('../helpers/validator');

        var validators = validator.validators;
        /**
         * Create a new instance of Axios
         *
         * @param {Object} instanceConfig The default config for the instance
         */
        function Axios(instanceConfig) {
          this.defaults = instanceConfig;
          this.interceptors = {
            request: new InterceptorManager(),
            response: new InterceptorManager(),
          };
        }

        /**
         * Dispatch a request
         *
         * @param {Object} config The config specific for this request (merged with this.defaults)
         */
        Axios.prototype.request = function request(configOrUrl, config) {
          /*eslint no-param-reassign:0*/
          // Allow for axios('example/url'[, config]) a la fetch API
          if (typeof configOrUrl === 'string') {
            config = config || {};
            config.url = configOrUrl;
          } else {
            config = configOrUrl || {};
          }

          config = mergeConfig(this.defaults, config);

          // Set config.method
          if (config.method) {
            config.method = config.method.toLowerCase();
          } else if (this.defaults.method) {
            config.method = this.defaults.method.toLowerCase();
          } else {
            config.method = 'get';
          }

          var transitional = config.transitional;

          if (transitional !== undefined) {
            validator.assertOptions(
              transitional,
              {
                silentJSONParsing: validators.transitional(validators.boolean),
                forcedJSONParsing: validators.transitional(validators.boolean),
                clarifyTimeoutError: validators.transitional(
                  validators.boolean
                ),
              },
              false
            );
          }

          // filter out skipped interceptors
          var requestInterceptorChain = [];
          var synchronousRequestInterceptors = true;
          this.interceptors.request.forEach(function unshiftRequestInterceptors(
            interceptor
          ) {
            if (
              typeof interceptor.runWhen === 'function' &&
              interceptor.runWhen(config) === false
            ) {
              return;
            }

            synchronousRequestInterceptors =
              synchronousRequestInterceptors && interceptor.synchronous;

            requestInterceptorChain.unshift(
              interceptor.fulfilled,
              interceptor.rejected
            );
          });

          var responseInterceptorChain = [];
          this.interceptors.response.forEach(function pushResponseInterceptors(
            interceptor
          ) {
            responseInterceptorChain.push(
              interceptor.fulfilled,
              interceptor.rejected
            );
          });

          var promise;

          if (!synchronousRequestInterceptors) {
            var chain = [dispatchRequest, undefined];

            Array.prototype.unshift.apply(chain, requestInterceptorChain);
            chain = chain.concat(responseInterceptorChain);

            promise = Promise.resolve(config);
            while (chain.length) {
              promise = promise.then(chain.shift(), chain.shift());
            }

            return promise;
          }

          var newConfig = config;
          while (requestInterceptorChain.length) {
            var onFulfilled = requestInterceptorChain.shift();
            var onRejected = requestInterceptorChain.shift();
            try {
              newConfig = onFulfilled(newConfig);
            } catch (error) {
              onRejected(error);
              break;
            }
          }

          try {
            promise = dispatchRequest(newConfig);
          } catch (error) {
            return Promise.reject(error);
          }

          while (responseInterceptorChain.length) {
            promise = promise.then(
              responseInterceptorChain.shift(),
              responseInterceptorChain.shift()
            );
          }

          return promise;
        };

        Axios.prototype.getUri = function getUri(config) {
          config = mergeConfig(this.defaults, config);
          return buildURL(
            config.url,
            config.params,
            config.paramsSerializer
          ).replace(/^\?/, '');
        };

        // Provide aliases for supported request methods
        utils.forEach(
          ['delete', 'get', 'head', 'options'],
          function forEachMethodNoData(method) {
            /*eslint func-names:0*/
            Axios.prototype[method] = function (url, config) {
              return this.request(
                mergeConfig(config || {}, {
                  method: method,
                  url: url,
                  data: (config || {}).data,
                })
              );
            };
          }
        );

        utils.forEach(
          ['post', 'put', 'patch'],
          function forEachMethodWithData(method) {
            /*eslint func-names:0*/
            Axios.prototype[method] = function (url, data, config) {
              return this.request(
                mergeConfig(config || {}, {
                  method: method,
                  url: url,
                  data: data,
                })
              );
            };
          }
        );

        module.exports = Axios;
      },
      {
        '../helpers/buildURL': 21,
        '../helpers/validator': 30,
        './../utils': 31,
        './InterceptorManager': 9,
        './dispatchRequest': 12,
        './mergeConfig': 14,
      },
    ],
    9: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');

        function InterceptorManager() {
          this.handlers = [];
        }

        /**
         * Add a new interceptor to the stack
         *
         * @param {Function} fulfilled The function to handle `then` for a `Promise`
         * @param {Function} rejected The function to handle `reject` for a `Promise`
         *
         * @return {Number} An ID used to remove interceptor later
         */
        InterceptorManager.prototype.use = function use(
          fulfilled,
          rejected,
          options
        ) {
          this.handlers.push({
            fulfilled: fulfilled,
            rejected: rejected,
            synchronous: options ? options.synchronous : false,
            runWhen: options ? options.runWhen : null,
          });
          return this.handlers.length - 1;
        };

        /**
         * Remove an interceptor from the stack
         *
         * @param {Number} id The ID that was returned by `use`
         */
        InterceptorManager.prototype.eject = function eject(id) {
          if (this.handlers[id]) {
            this.handlers[id] = null;
          }
        };

        /**
         * Iterate over all the registered interceptors
         *
         * This method is particularly useful for skipping over any
         * interceptors that may have become `null` calling `eject`.
         *
         * @param {Function} fn The function to call for each interceptor
         */
        InterceptorManager.prototype.forEach = function forEach(fn) {
          utils.forEach(this.handlers, function forEachHandler(h) {
            if (h !== null) {
              fn(h);
            }
          });
        };

        module.exports = InterceptorManager;
      },
      { './../utils': 31 },
    ],
    10: [
      function (require, module, exports) {
        'use strict';

        var isAbsoluteURL = require('../helpers/isAbsoluteURL');
        var combineURLs = require('../helpers/combineURLs');

        /**
         * Creates a new URL by combining the baseURL with the requestedURL,
         * only when the requestedURL is not already an absolute URL.
         * If the requestURL is absolute, this function returns the requestedURL untouched.
         *
         * @param {string} baseURL The base URL
         * @param {string} requestedURL Absolute or relative URL to combine
         * @returns {string} The combined full path
         */
        module.exports = function buildFullPath(baseURL, requestedURL) {
          if (baseURL && !isAbsoluteURL(requestedURL)) {
            return combineURLs(baseURL, requestedURL);
          }
          return requestedURL;
        };
      },
      { '../helpers/combineURLs': 22, '../helpers/isAbsoluteURL': 24 },
    ],
    11: [
      function (require, module, exports) {
        'use strict';

        var enhanceError = require('./enhanceError');

        /**
         * Create an Error with the specified message, config, error code, request and response.
         *
         * @param {string} message The error message.
         * @param {Object} config The config.
         * @param {string} [code] The error code (for example, 'ECONNABORTED').
         * @param {Object} [request] The request.
         * @param {Object} [response] The response.
         * @returns {Error} The created error.
         */
        module.exports = function createError(
          message,
          config,
          code,
          request,
          response
        ) {
          var error = new Error(message);
          return enhanceError(error, config, code, request, response);
        };
      },
      { './enhanceError': 13 },
    ],
    12: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');
        var transformData = require('./transformData');
        var isCancel = require('../cancel/isCancel');
        var defaults = require('../defaults');
        var Cancel = require('../cancel/Cancel');

        /**
         * Throws a `Cancel` if cancellation has been requested.
         */
        function throwIfCancellationRequested(config) {
          if (config.cancelToken) {
            config.cancelToken.throwIfRequested();
          }

          if (config.signal && config.signal.aborted) {
            throw new Cancel('canceled');
          }
        }

        /**
         * Dispatch a request to the server using the configured adapter.
         *
         * @param {object} config The config that is to be used for the request
         * @returns {Promise} The Promise to be fulfilled
         */
        module.exports = function dispatchRequest(config) {
          throwIfCancellationRequested(config);

          // Ensure headers exist
          config.headers = config.headers || {};

          // Transform request data
          config.data = transformData.call(
            config,
            config.data,
            config.headers,
            config.transformRequest
          );

          // Flatten headers
          config.headers = utils.merge(
            config.headers.common || {},
            config.headers[config.method] || {},
            config.headers
          );

          utils.forEach(
            ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
            function cleanHeaderConfig(method) {
              delete config.headers[method];
            }
          );

          var adapter = config.adapter || defaults.adapter;

          return adapter(config).then(
            function onAdapterResolution(response) {
              throwIfCancellationRequested(config);

              // Transform response data
              response.data = transformData.call(
                config,
                response.data,
                response.headers,
                config.transformResponse
              );

              return response;
            },
            function onAdapterRejection(reason) {
              if (!isCancel(reason)) {
                throwIfCancellationRequested(config);

                // Transform response data
                if (reason && reason.response) {
                  reason.response.data = transformData.call(
                    config,
                    reason.response.data,
                    reason.response.headers,
                    config.transformResponse
                  );
                }
              }

              return Promise.reject(reason);
            }
          );
        };
      },
      {
        '../cancel/Cancel': 5,
        '../cancel/isCancel': 7,
        '../defaults': 17,
        './../utils': 31,
        './transformData': 16,
      },
    ],
    13: [
      function (require, module, exports) {
        'use strict';

        /**
         * Update an Error with the specified config, error code, and response.
         *
         * @param {Error} error The error to update.
         * @param {Object} config The config.
         * @param {string} [code] The error code (for example, 'ECONNABORTED').
         * @param {Object} [request] The request.
         * @param {Object} [response] The response.
         * @returns {Error} The error.
         */
        module.exports = function enhanceError(
          error,
          config,
          code,
          request,
          response
        ) {
          error.config = config;
          if (code) {
            error.code = code;
          }

          error.request = request;
          error.response = response;
          error.isAxiosError = true;

          error.toJSON = function toJSON() {
            return {
              // Standard
              message: this.message,
              name: this.name,
              // Microsoft
              description: this.description,
              number: this.number,
              // Mozilla
              fileName: this.fileName,
              lineNumber: this.lineNumber,
              columnNumber: this.columnNumber,
              stack: this.stack,
              // Axios
              config: this.config,
              code: this.code,
              status:
                this.response && this.response.status
                  ? this.response.status
                  : null,
            };
          };
          return error;
        };
      },
      {},
    ],
    14: [
      function (require, module, exports) {
        'use strict';

        var utils = require('../utils');

        /**
         * Config-specific merge-function which creates a new config-object
         * by merging two configuration objects together.
         *
         * @param {Object} config1
         * @param {Object} config2
         * @returns {Object} New object resulting from merging config2 to config1
         */
        module.exports = function mergeConfig(config1, config2) {
          // eslint-disable-next-line no-param-reassign
          config2 = config2 || {};
          var config = {};

          function getMergedValue(target, source) {
            if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
              return utils.merge(target, source);
            } else if (utils.isPlainObject(source)) {
              return utils.merge({}, source);
            } else if (utils.isArray(source)) {
              return source.slice();
            }
            return source;
          }

          // eslint-disable-next-line consistent-return
          function mergeDeepProperties(prop) {
            if (!utils.isUndefined(config2[prop])) {
              return getMergedValue(config1[prop], config2[prop]);
            } else if (!utils.isUndefined(config1[prop])) {
              return getMergedValue(undefined, config1[prop]);
            }
          }

          // eslint-disable-next-line consistent-return
          function valueFromConfig2(prop) {
            if (!utils.isUndefined(config2[prop])) {
              return getMergedValue(undefined, config2[prop]);
            }
          }

          // eslint-disable-next-line consistent-return
          function defaultToConfig2(prop) {
            if (!utils.isUndefined(config2[prop])) {
              return getMergedValue(undefined, config2[prop]);
            } else if (!utils.isUndefined(config1[prop])) {
              return getMergedValue(undefined, config1[prop]);
            }
          }

          // eslint-disable-next-line consistent-return
          function mergeDirectKeys(prop) {
            if (prop in config2) {
              return getMergedValue(config1[prop], config2[prop]);
            } else if (prop in config1) {
              return getMergedValue(undefined, config1[prop]);
            }
          }

          var mergeMap = {
            url: valueFromConfig2,
            method: valueFromConfig2,
            data: valueFromConfig2,
            baseURL: defaultToConfig2,
            transformRequest: defaultToConfig2,
            transformResponse: defaultToConfig2,
            paramsSerializer: defaultToConfig2,
            timeout: defaultToConfig2,
            timeoutMessage: defaultToConfig2,
            withCredentials: defaultToConfig2,
            adapter: defaultToConfig2,
            responseType: defaultToConfig2,
            xsrfCookieName: defaultToConfig2,
            xsrfHeaderName: defaultToConfig2,
            onUploadProgress: defaultToConfig2,
            onDownloadProgress: defaultToConfig2,
            decompress: defaultToConfig2,
            maxContentLength: defaultToConfig2,
            maxBodyLength: defaultToConfig2,
            transport: defaultToConfig2,
            httpAgent: defaultToConfig2,
            httpsAgent: defaultToConfig2,
            cancelToken: defaultToConfig2,
            socketPath: defaultToConfig2,
            responseEncoding: defaultToConfig2,
            validateStatus: mergeDirectKeys,
          };

          utils.forEach(
            Object.keys(config1).concat(Object.keys(config2)),
            function computeConfigValue(prop) {
              var merge = mergeMap[prop] || mergeDeepProperties;
              var configValue = merge(prop);
              (utils.isUndefined(configValue) && merge !== mergeDirectKeys) ||
                (config[prop] = configValue);
            }
          );

          return config;
        };
      },
      { '../utils': 31 },
    ],
    15: [
      function (require, module, exports) {
        'use strict';

        var createError = require('./createError');

        /**
         * Resolve or reject a Promise based on response status.
         *
         * @param {Function} resolve A function that resolves the promise.
         * @param {Function} reject A function that rejects the promise.
         * @param {object} response The response.
         */
        module.exports = function settle(resolve, reject, response) {
          var validateStatus = response.config.validateStatus;
          if (
            !response.status ||
            !validateStatus ||
            validateStatus(response.status)
          ) {
            resolve(response);
          } else {
            reject(
              createError(
                'Request failed with status code ' + response.status,
                response.config,
                null,
                response.request,
                response
              )
            );
          }
        };
      },
      { './createError': 11 },
    ],
    16: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');
        var defaults = require('../defaults');

        /**
         * Transform the data for a request or a response
         *
         * @param {Object|String} data The data to be transformed
         * @param {Array} headers The headers for the request or response
         * @param {Array|Function} fns A single function or Array of functions
         * @returns {*} The resulting transformed data
         */
        module.exports = function transformData(data, headers, fns) {
          var context = this || defaults;
          /*eslint no-param-reassign:0*/
          utils.forEach(fns, function transform(fn) {
            data = fn.call(context, data, headers);
          });

          return data;
        };
      },
      { '../defaults': 17, './../utils': 31 },
    ],
    17: [
      function (require, module, exports) {
        (function (process) {
          (function () {
            'use strict';

            var utils = require('../utils');
            var normalizeHeaderName = require('../helpers/normalizeHeaderName');
            var enhanceError = require('../core/enhanceError');
            var transitionalDefaults = require('./transitional');

            var DEFAULT_CONTENT_TYPE = {
              'Content-Type': 'application/x-www-form-urlencoded',
            };

            function setContentTypeIfUnset(headers, value) {
              if (
                !utils.isUndefined(headers) &&
                utils.isUndefined(headers['Content-Type'])
              ) {
                headers['Content-Type'] = value;
              }
            }

            function getDefaultAdapter() {
              var adapter;
              if (typeof XMLHttpRequest !== 'undefined') {
                // For browsers use XHR adapter
                adapter = require('../adapters/xhr');
              } else if (
                typeof process !== 'undefined' &&
                Object.prototype.toString.call(process) === '[object process]'
              ) {
                // For node use HTTP adapter
                adapter = require('../adapters/http');
              }
              return adapter;
            }

            function stringifySafely(rawValue, parser, encoder) {
              if (utils.isString(rawValue)) {
                try {
                  (parser || JSON.parse)(rawValue);
                  return utils.trim(rawValue);
                } catch (e) {
                  if (e.name !== 'SyntaxError') {
                    throw e;
                  }
                }
              }

              return (encoder || JSON.stringify)(rawValue);
            }

            var defaults = {
              transitional: transitionalDefaults,

              adapter: getDefaultAdapter(),

              transformRequest: [
                function transformRequest(data, headers) {
                  normalizeHeaderName(headers, 'Accept');
                  normalizeHeaderName(headers, 'Content-Type');

                  if (
                    utils.isFormData(data) ||
                    utils.isArrayBuffer(data) ||
                    utils.isBuffer(data) ||
                    utils.isStream(data) ||
                    utils.isFile(data) ||
                    utils.isBlob(data)
                  ) {
                    return data;
                  }
                  if (utils.isArrayBufferView(data)) {
                    return data.buffer;
                  }
                  if (utils.isURLSearchParams(data)) {
                    setContentTypeIfUnset(
                      headers,
                      'application/x-www-form-urlencoded;charset=utf-8'
                    );
                    return data.toString();
                  }
                  if (
                    utils.isObject(data) ||
                    (headers && headers['Content-Type'] === 'application/json')
                  ) {
                    setContentTypeIfUnset(headers, 'application/json');
                    return stringifySafely(data);
                  }
                  return data;
                },
              ],

              transformResponse: [
                function transformResponse(data) {
                  var transitional = this.transitional || defaults.transitional;
                  var silentJSONParsing =
                    transitional && transitional.silentJSONParsing;
                  var forcedJSONParsing =
                    transitional && transitional.forcedJSONParsing;
                  var strictJSONParsing =
                    !silentJSONParsing && this.responseType === 'json';

                  if (
                    strictJSONParsing ||
                    (forcedJSONParsing && utils.isString(data) && data.length)
                  ) {
                    try {
                      return JSON.parse(data);
                    } catch (e) {
                      if (strictJSONParsing) {
                        if (e.name === 'SyntaxError') {
                          throw enhanceError(e, this, 'E_JSON_PARSE');
                        }
                        throw e;
                      }
                    }
                  }

                  return data;
                },
              ],

              /**
               * A timeout in milliseconds to abort a request. If set to 0 (default) a
               * timeout is not created.
               */
              timeout: 0,

              xsrfCookieName: 'XSRF-TOKEN',
              xsrfHeaderName: 'X-XSRF-TOKEN',

              maxContentLength: -1,
              maxBodyLength: -1,

              validateStatus: function validateStatus(status) {
                return status >= 200 && status < 300;
              },

              headers: {
                common: {
                  Accept: 'application/json, text/plain, */*',
                },
              },
            };

            utils.forEach(
              ['delete', 'get', 'head'],
              function forEachMethodNoData(method) {
                defaults.headers[method] = {};
              }
            );

            utils.forEach(
              ['post', 'put', 'patch'],
              function forEachMethodWithData(method) {
                defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
              }
            );

            module.exports = defaults;
          }.call(this));
        }.call(this, require('_process')));
      },
      {
        '../adapters/http': 3,
        '../adapters/xhr': 3,
        '../core/enhanceError': 13,
        '../helpers/normalizeHeaderName': 27,
        '../utils': 31,
        './transitional': 18,
        _process: 39,
      },
    ],
    18: [
      function (require, module, exports) {
        'use strict';

        module.exports = {
          silentJSONParsing: true,
          forcedJSONParsing: true,
          clarifyTimeoutError: false,
        };
      },
      {},
    ],
    19: [
      function (require, module, exports) {
        module.exports = {
          version: '0.26.1',
        };
      },
      {},
    ],
    20: [
      function (require, module, exports) {
        'use strict';

        module.exports = function bind(fn, thisArg) {
          return function wrap() {
            var args = new Array(arguments.length);
            for (var i = 0; i < args.length; i++) {
              args[i] = arguments[i];
            }
            return fn.apply(thisArg, args);
          };
        };
      },
      {},
    ],
    21: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');

        function encode(val) {
          return encodeURIComponent(val)
            .replace(/%3A/gi, ':')
            .replace(/%24/g, '$')
            .replace(/%2C/gi, ',')
            .replace(/%20/g, '+')
            .replace(/%5B/gi, '[')
            .replace(/%5D/gi, ']');
        }

        /**
         * Build a URL by appending params to the end
         *
         * @param {string} url The base of the url (e.g., http://www.google.com)
         * @param {object} [params] The params to be appended
         * @returns {string} The formatted url
         */
        module.exports = function buildURL(url, params, paramsSerializer) {
          /*eslint no-param-reassign:0*/
          if (!params) {
            return url;
          }

          var serializedParams;
          if (paramsSerializer) {
            serializedParams = paramsSerializer(params);
          } else if (utils.isURLSearchParams(params)) {
            serializedParams = params.toString();
          } else {
            var parts = [];

            utils.forEach(params, function serialize(val, key) {
              if (val === null || typeof val === 'undefined') {
                return;
              }

              if (utils.isArray(val)) {
                key = key + '[]';
              } else {
                val = [val];
              }

              utils.forEach(val, function parseValue(v) {
                if (utils.isDate(v)) {
                  v = v.toISOString();
                } else if (utils.isObject(v)) {
                  v = JSON.stringify(v);
                }
                parts.push(encode(key) + '=' + encode(v));
              });
            });

            serializedParams = parts.join('&');
          }

          if (serializedParams) {
            var hashmarkIndex = url.indexOf('#');
            if (hashmarkIndex !== -1) {
              url = url.slice(0, hashmarkIndex);
            }

            url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
          }

          return url;
        };
      },
      { './../utils': 31 },
    ],
    22: [
      function (require, module, exports) {
        'use strict';

        /**
         * Creates a new URL by combining the specified URLs
         *
         * @param {string} baseURL The base URL
         * @param {string} relativeURL The relative URL
         * @returns {string} The combined URL
         */
        module.exports = function combineURLs(baseURL, relativeURL) {
          return relativeURL
            ? baseURL.replace(/\/+$/, '') +
                '/' +
                relativeURL.replace(/^\/+/, '')
            : baseURL;
        };
      },
      {},
    ],
    23: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');

        module.exports = utils.isStandardBrowserEnv()
          ? // Standard browser envs support document.cookie
            (function standardBrowserEnv() {
              return {
                write: function write(
                  name,
                  value,
                  expires,
                  path,
                  domain,
                  secure
                ) {
                  var cookie = [];
                  cookie.push(name + '=' + encodeURIComponent(value));

                  if (utils.isNumber(expires)) {
                    cookie.push('expires=' + new Date(expires).toGMTString());
                  }

                  if (utils.isString(path)) {
                    cookie.push('path=' + path);
                  }

                  if (utils.isString(domain)) {
                    cookie.push('domain=' + domain);
                  }

                  if (secure === true) {
                    cookie.push('secure');
                  }

                  document.cookie = cookie.join('; ');
                },

                read: function read(name) {
                  var match = document.cookie.match(
                    new RegExp('(^|;\\s*)(' + name + ')=([^;]*)')
                  );
                  return match ? decodeURIComponent(match[3]) : null;
                },

                remove: function remove(name) {
                  this.write(name, '', Date.now() - 86400000);
                },
              };
            })()
          : // Non standard browser env (web workers, react-native) lack needed support.
            (function nonStandardBrowserEnv() {
              return {
                write: function write() {},
                read: function read() {
                  return null;
                },
                remove: function remove() {},
              };
            })();
      },
      { './../utils': 31 },
    ],
    24: [
      function (require, module, exports) {
        'use strict';

        /**
         * Determines whether the specified URL is absolute
         *
         * @param {string} url The URL to test
         * @returns {boolean} True if the specified URL is absolute, otherwise false
         */
        module.exports = function isAbsoluteURL(url) {
          // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
          // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
          // by any combination of letters, digits, plus, period, or hyphen.
          return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
        };
      },
      {},
    ],
    25: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');

        /**
         * Determines whether the payload is an error thrown by Axios
         *
         * @param {*} payload The value to test
         * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
         */
        module.exports = function isAxiosError(payload) {
          return utils.isObject(payload) && payload.isAxiosError === true;
        };
      },
      { './../utils': 31 },
    ],
    26: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');

        module.exports = utils.isStandardBrowserEnv()
          ? // Standard browser envs have full support of the APIs needed to test
            // whether the request URL is of the same origin as current location.
            (function standardBrowserEnv() {
              var msie = /(msie|trident)/i.test(navigator.userAgent);
              var urlParsingNode = document.createElement('a');
              var originURL;

              /**
               * Parse a URL to discover it's components
               *
               * @param {String} url The URL to be parsed
               * @returns {Object}
               */
              function resolveURL(url) {
                var href = url;

                if (msie) {
                  // IE needs attribute set twice to normalize properties
                  urlParsingNode.setAttribute('href', href);
                  href = urlParsingNode.href;
                }

                urlParsingNode.setAttribute('href', href);

                // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
                return {
                  href: urlParsingNode.href,
                  protocol: urlParsingNode.protocol
                    ? urlParsingNode.protocol.replace(/:$/, '')
                    : '',
                  host: urlParsingNode.host,
                  search: urlParsingNode.search
                    ? urlParsingNode.search.replace(/^\?/, '')
                    : '',
                  hash: urlParsingNode.hash
                    ? urlParsingNode.hash.replace(/^#/, '')
                    : '',
                  hostname: urlParsingNode.hostname,
                  port: urlParsingNode.port,
                  pathname:
                    urlParsingNode.pathname.charAt(0) === '/'
                      ? urlParsingNode.pathname
                      : '/' + urlParsingNode.pathname,
                };
              }

              originURL = resolveURL(window.location.href);

              /**
               * Determine if a URL shares the same origin as the current location
               *
               * @param {String} requestURL The URL to test
               * @returns {boolean} True if URL shares the same origin, otherwise false
               */
              return function isURLSameOrigin(requestURL) {
                var parsed = utils.isString(requestURL)
                  ? resolveURL(requestURL)
                  : requestURL;
                return (
                  parsed.protocol === originURL.protocol &&
                  parsed.host === originURL.host
                );
              };
            })()
          : // Non standard browser envs (web workers, react-native) lack needed support.
            (function nonStandardBrowserEnv() {
              return function isURLSameOrigin() {
                return true;
              };
            })();
      },
      { './../utils': 31 },
    ],
    27: [
      function (require, module, exports) {
        'use strict';

        var utils = require('../utils');

        module.exports = function normalizeHeaderName(headers, normalizedName) {
          utils.forEach(headers, function processHeader(value, name) {
            if (
              name !== normalizedName &&
              name.toUpperCase() === normalizedName.toUpperCase()
            ) {
              headers[normalizedName] = value;
              delete headers[name];
            }
          });
        };
      },
      { '../utils': 31 },
    ],
    28: [
      function (require, module, exports) {
        'use strict';

        var utils = require('./../utils');

        // Headers whose duplicates are ignored by node
        // c.f. https://nodejs.org/api/http.html#http_message_headers
        var ignoreDuplicateOf = [
          'age',
          'authorization',
          'content-length',
          'content-type',
          'etag',
          'expires',
          'from',
          'host',
          'if-modified-since',
          'if-unmodified-since',
          'last-modified',
          'location',
          'max-forwards',
          'proxy-authorization',
          'referer',
          'retry-after',
          'user-agent',
        ];

        /**
         * Parse headers into an object
         *
         * ```
         * Date: Wed, 27 Aug 2014 08:58:49 GMT
         * Content-Type: application/json
         * Connection: keep-alive
         * Transfer-Encoding: chunked
         * ```
         *
         * @param {String} headers Headers needing to be parsed
         * @returns {Object} Headers parsed into an object
         */
        module.exports = function parseHeaders(headers) {
          var parsed = {};
          var key;
          var val;
          var i;

          if (!headers) {
            return parsed;
          }

          utils.forEach(headers.split('\n'), function parser(line) {
            i = line.indexOf(':');
            key = utils.trim(line.substr(0, i)).toLowerCase();
            val = utils.trim(line.substr(i + 1));

            if (key) {
              if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
                return;
              }
              if (key === 'set-cookie') {
                parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
              } else {
                parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
              }
            }
          });

          return parsed;
        };
      },
      { './../utils': 31 },
    ],
    29: [
      function (require, module, exports) {
        'use strict';

        /**
         * Syntactic sugar for invoking a function and expanding an array for arguments.
         *
         * Common use case would be to use `Function.prototype.apply`.
         *
         *  ```js
         *  function f(x, y, z) {}
         *  var args = [1, 2, 3];
         *  f.apply(null, args);
         *  ```
         *
         * With `spread` this example can be re-written.
         *
         *  ```js
         *  spread(function(x, y, z) {})([1, 2, 3]);
         *  ```
         *
         * @param {Function} callback
         * @returns {Function}
         */
        module.exports = function spread(callback) {
          return function wrap(arr) {
            return callback.apply(null, arr);
          };
        };
      },
      {},
    ],
    30: [
      function (require, module, exports) {
        'use strict';

        var VERSION = require('../env/data').version;

        var validators = {};

        // eslint-disable-next-line func-names
        ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(
          function (type, i) {
            validators[type] = function validator(thing) {
              return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
            };
          }
        );

        var deprecatedWarnings = {};

        /**
         * Transitional option validator
         * @param {function|boolean?} validator - set to false if the transitional option has been removed
         * @param {string?} version - deprecated version / removed since version
         * @param {string?} message - some message with additional info
         * @returns {function}
         */
        validators.transitional = function transitional(
          validator,
          version,
          message
        ) {
          function formatMessage(opt, desc) {
            return (
              '[Axios v' +
              VERSION +
              "] Transitional option '" +
              opt +
              "'" +
              desc +
              (message ? '. ' + message : '')
            );
          }

          // eslint-disable-next-line func-names
          return function (value, opt, opts) {
            if (validator === false) {
              throw new Error(
                formatMessage(
                  opt,
                  ' has been removed' + (version ? ' in ' + version : '')
                )
              );
            }

            if (version && !deprecatedWarnings[opt]) {
              deprecatedWarnings[opt] = true;
              // eslint-disable-next-line no-console
              console.warn(
                formatMessage(
                  opt,
                  ' has been deprecated since v' +
                    version +
                    ' and will be removed in the near future'
                )
              );
            }

            return validator ? validator(value, opt, opts) : true;
          };
        };

        /**
         * Assert object's properties type
         * @param {object} options
         * @param {object} schema
         * @param {boolean?} allowUnknown
         */

        function assertOptions(options, schema, allowUnknown) {
          if (typeof options !== 'object') {
            throw new TypeError('options must be an object');
          }
          var keys = Object.keys(options);
          var i = keys.length;
          while (i-- > 0) {
            var opt = keys[i];
            var validator = schema[opt];
            if (validator) {
              var value = options[opt];
              var result =
                value === undefined || validator(value, opt, options);
              if (result !== true) {
                throw new TypeError('option ' + opt + ' must be ' + result);
              }
              continue;
            }
            if (allowUnknown !== true) {
              throw Error('Unknown option ' + opt);
            }
          }
        }

        module.exports = {
          assertOptions: assertOptions,
          validators: validators,
        };
      },
      { '../env/data': 19 },
    ],
    31: [
      function (require, module, exports) {
        'use strict';

        var bind = require('./helpers/bind');

        // utils is a library of generic helper functions non-specific to axios

        var toString = Object.prototype.toString;

        /**
         * Determine if a value is an Array
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is an Array, otherwise false
         */
        function isArray(val) {
          return Array.isArray(val);
        }

        /**
         * Determine if a value is undefined
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if the value is undefined, otherwise false
         */
        function isUndefined(val) {
          return typeof val === 'undefined';
        }

        /**
         * Determine if a value is a Buffer
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a Buffer, otherwise false
         */
        function isBuffer(val) {
          return (
            val !== null &&
            !isUndefined(val) &&
            val.constructor !== null &&
            !isUndefined(val.constructor) &&
            typeof val.constructor.isBuffer === 'function' &&
            val.constructor.isBuffer(val)
          );
        }

        /**
         * Determine if a value is an ArrayBuffer
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is an ArrayBuffer, otherwise false
         */
        function isArrayBuffer(val) {
          return toString.call(val) === '[object ArrayBuffer]';
        }

        /**
         * Determine if a value is a FormData
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is an FormData, otherwise false
         */
        function isFormData(val) {
          return toString.call(val) === '[object FormData]';
        }

        /**
         * Determine if a value is a view on an ArrayBuffer
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
         */
        function isArrayBufferView(val) {
          var result;
          if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
            result = ArrayBuffer.isView(val);
          } else {
            result = val && val.buffer && isArrayBuffer(val.buffer);
          }
          return result;
        }

        /**
         * Determine if a value is a String
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a String, otherwise false
         */
        function isString(val) {
          return typeof val === 'string';
        }

        /**
         * Determine if a value is a Number
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a Number, otherwise false
         */
        function isNumber(val) {
          return typeof val === 'number';
        }

        /**
         * Determine if a value is an Object
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is an Object, otherwise false
         */
        function isObject(val) {
          return val !== null && typeof val === 'object';
        }

        /**
         * Determine if a value is a plain Object
         *
         * @param {Object} val The value to test
         * @return {boolean} True if value is a plain Object, otherwise false
         */
        function isPlainObject(val) {
          if (toString.call(val) !== '[object Object]') {
            return false;
          }

          var prototype = Object.getPrototypeOf(val);
          return prototype === null || prototype === Object.prototype;
        }

        /**
         * Determine if a value is a Date
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a Date, otherwise false
         */
        function isDate(val) {
          return toString.call(val) === '[object Date]';
        }

        /**
         * Determine if a value is a File
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a File, otherwise false
         */
        function isFile(val) {
          return toString.call(val) === '[object File]';
        }

        /**
         * Determine if a value is a Blob
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a Blob, otherwise false
         */
        function isBlob(val) {
          return toString.call(val) === '[object Blob]';
        }

        /**
         * Determine if a value is a Function
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a Function, otherwise false
         */
        function isFunction(val) {
          return toString.call(val) === '[object Function]';
        }

        /**
         * Determine if a value is a Stream
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a Stream, otherwise false
         */
        function isStream(val) {
          return isObject(val) && isFunction(val.pipe);
        }

        /**
         * Determine if a value is a URLSearchParams object
         *
         * @param {Object} val The value to test
         * @returns {boolean} True if value is a URLSearchParams object, otherwise false
         */
        function isURLSearchParams(val) {
          return toString.call(val) === '[object URLSearchParams]';
        }

        /**
         * Trim excess whitespace off the beginning and end of a string
         *
         * @param {String} str The String to trim
         * @returns {String} The String freed of excess whitespace
         */
        function trim(str) {
          return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
        }

        /**
         * Determine if we're running in a standard browser environment
         *
         * This allows axios to run in a web worker, and react-native.
         * Both environments support XMLHttpRequest, but not fully standard globals.
         *
         * web workers:
         *  typeof window -> undefined
         *  typeof document -> undefined
         *
         * react-native:
         *  navigator.product -> 'ReactNative'
         * nativescript
         *  navigator.product -> 'NativeScript' or 'NS'
         */
        function isStandardBrowserEnv() {
          if (
            typeof navigator !== 'undefined' &&
            (navigator.product === 'ReactNative' ||
              navigator.product === 'NativeScript' ||
              navigator.product === 'NS')
          ) {
            return false;
          }
          return (
            typeof window !== 'undefined' && typeof document !== 'undefined'
          );
        }

        /**
         * Iterate over an Array or an Object invoking a function for each item.
         *
         * If `obj` is an Array callback will be called passing
         * the value, index, and complete array for each item.
         *
         * If 'obj' is an Object callback will be called passing
         * the value, key, and complete object for each property.
         *
         * @param {Object|Array} obj The object to iterate
         * @param {Function} fn The callback to invoke for each item
         */
        function forEach(obj, fn) {
          // Don't bother if no value provided
          if (obj === null || typeof obj === 'undefined') {
            return;
          }

          // Force an array if not already something iterable
          if (typeof obj !== 'object') {
            /*eslint no-param-reassign:0*/
            obj = [obj];
          }

          if (isArray(obj)) {
            // Iterate over array values
            for (var i = 0, l = obj.length; i < l; i++) {
              fn.call(null, obj[i], i, obj);
            }
          } else {
            // Iterate over object keys
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) {
                fn.call(null, obj[key], key, obj);
              }
            }
          }
        }

        /**
         * Accepts varargs expecting each argument to be an object, then
         * immutably merges the properties of each object and returns result.
         *
         * When multiple objects contain the same key the later object in
         * the arguments list will take precedence.
         *
         * Example:
         *
         * ```js
         * var result = merge({foo: 123}, {foo: 456});
         * console.log(result.foo); // outputs 456
         * ```
         *
         * @param {Object} obj1 Object to merge
         * @returns {Object} Result of all merge properties
         */
        function merge(/* obj1, obj2, obj3, ... */) {
          var result = {};
          function assignValue(val, key) {
            if (isPlainObject(result[key]) && isPlainObject(val)) {
              result[key] = merge(result[key], val);
            } else if (isPlainObject(val)) {
              result[key] = merge({}, val);
            } else if (isArray(val)) {
              result[key] = val.slice();
            } else {
              result[key] = val;
            }
          }

          for (var i = 0, l = arguments.length; i < l; i++) {
            forEach(arguments[i], assignValue);
          }
          return result;
        }

        /**
         * Extends object a by mutably adding to it the properties of object b.
         *
         * @param {Object} a The object to be extended
         * @param {Object} b The object to copy properties from
         * @param {Object} thisArg The object to bind function to
         * @return {Object} The resulting value of object a
         */
        function extend(a, b, thisArg) {
          forEach(b, function assignValue(val, key) {
            if (thisArg && typeof val === 'function') {
              a[key] = bind(val, thisArg);
            } else {
              a[key] = val;
            }
          });
          return a;
        }

        /**
         * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
         *
         * @param {string} content with BOM
         * @return {string} content value without BOM
         */
        function stripBOM(content) {
          if (content.charCodeAt(0) === 0xfeff) {
            content = content.slice(1);
          }
          return content;
        }

        module.exports = {
          isArray: isArray,
          isArrayBuffer: isArrayBuffer,
          isBuffer: isBuffer,
          isFormData: isFormData,
          isArrayBufferView: isArrayBufferView,
          isString: isString,
          isNumber: isNumber,
          isObject: isObject,
          isPlainObject: isPlainObject,
          isUndefined: isUndefined,
          isDate: isDate,
          isFile: isFile,
          isBlob: isBlob,
          isFunction: isFunction,
          isStream: isStream,
          isURLSearchParams: isURLSearchParams,
          isStandardBrowserEnv: isStandardBrowserEnv,
          forEach: forEach,
          merge: merge,
          extend: extend,
          trim: trim,
          stripBOM: stripBOM,
        };
      },
      { './helpers/bind': 20 },
    ],
    32: [
      function (require, module, exports) {
        /* eslint-env browser */
        module.exports =
          typeof self == 'object' ? self.FormData : window.FormData;
      },
      {},
    ],
    33: [
      function (require, module, exports) {
        'use strict';
        /* tslint:disable */
        /* eslint-disable */
        /**
         * OpenAI API
         * APIs for sampling from and fine-tuning language models
         *
         * The version of the OpenAPI document: 1.1.0
         *
         *
         * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
         * https://openapi-generator.tech
         * Do not edit the class manually.
         */
        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.OpenAIApi =
          exports.OpenAIApiFactory =
          exports.OpenAIApiFp =
          exports.OpenAIApiAxiosParamCreator =
          exports.CreateImageRequestResponseFormatEnum =
          exports.CreateImageRequestSizeEnum =
            void 0;
        const axios_1 = require('axios');
        // Some imports not used depending on template conditions
        // @ts-ignore
        const common_1 = require('./common');
        // @ts-ignore
        const base_1 = require('./base');
        exports.CreateImageRequestSizeEnum = {
          _256x256: '256x256',
          _512x512: '512x512',
          _1024x1024: '1024x1024',
        };
        exports.CreateImageRequestResponseFormatEnum = {
          Url: 'url',
          B64Json: 'b64_json',
        };
        /**
         * OpenAIApi - axios parameter creator
         * @export
         */
        exports.OpenAIApiAxiosParamCreator = function (configuration) {
          return {
            /**
             *
             * @summary Immediately cancel a fine-tune job.
             * @param {string} fineTuneId The ID of the fine-tune job to cancel
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            cancelFineTune: (fineTuneId, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'fineTuneId' is not null or undefined
                common_1.assertParamExists(
                  'cancelFineTune',
                  'fineTuneId',
                  fineTuneId
                );
                const localVarPath =
                  `/fine-tunes/{fine_tune_id}/cancel`.replace(
                    `{${'fine_tune_id'}}`,
                    encodeURIComponent(String(fineTuneId))
                  );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
             * @param {CreateAnswerRequest} createAnswerRequest
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            createAnswer: (createAnswerRequest, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'createAnswerRequest' is not null or undefined
                common_1.assertParamExists(
                  'createAnswer',
                  'createAnswerRequest',
                  createAnswerRequest
                );
                const localVarPath = `/answers`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                localVarHeaderParameter['Content-Type'] = 'application/json';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = common_1.serializeDataIfNeeded(
                  createAnswerRequest,
                  localVarRequestOptions,
                  configuration
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
             * @param {CreateClassificationRequest} createClassificationRequest
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            createClassification: (createClassificationRequest, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'createClassificationRequest' is not null or undefined
                common_1.assertParamExists(
                  'createClassification',
                  'createClassificationRequest',
                  createClassificationRequest
                );
                const localVarPath = `/classifications`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                localVarHeaderParameter['Content-Type'] = 'application/json';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = common_1.serializeDataIfNeeded(
                  createClassificationRequest,
                  localVarRequestOptions,
                  configuration
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Creates a completion for the provided prompt and parameters
             * @param {CreateCompletionRequest} createCompletionRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createCompletion: (createCompletionRequest, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'createCompletionRequest' is not null or undefined
                common_1.assertParamExists(
                  'createCompletion',
                  'createCompletionRequest',
                  createCompletionRequest
                );
                const localVarPath = `/completions`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                localVarHeaderParameter['Content-Type'] = 'application/json';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = common_1.serializeDataIfNeeded(
                  createCompletionRequest,
                  localVarRequestOptions,
                  configuration
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Creates a new edit for the provided input, instruction, and parameters
             * @param {CreateEditRequest} createEditRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createEdit: (createEditRequest, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'createEditRequest' is not null or undefined
                common_1.assertParamExists(
                  'createEdit',
                  'createEditRequest',
                  createEditRequest
                );
                const localVarPath = `/edits`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                localVarHeaderParameter['Content-Type'] = 'application/json';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = common_1.serializeDataIfNeeded(
                  createEditRequest,
                  localVarRequestOptions,
                  configuration
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Creates an embedding vector representing the input text.
             * @param {CreateEmbeddingRequest} createEmbeddingRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createEmbedding: (createEmbeddingRequest, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'createEmbeddingRequest' is not null or undefined
                common_1.assertParamExists(
                  'createEmbedding',
                  'createEmbeddingRequest',
                  createEmbeddingRequest
                );
                const localVarPath = `/embeddings`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                localVarHeaderParameter['Content-Type'] = 'application/json';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = common_1.serializeDataIfNeeded(
                  createEmbeddingRequest,
                  localVarRequestOptions,
                  configuration
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
             * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
             * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createFile: (file, purpose, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'file' is not null or undefined
                common_1.assertParamExists('createFile', 'file', file);
                // verify required parameter 'purpose' is not null or undefined
                common_1.assertParamExists('createFile', 'purpose', purpose);
                const localVarPath = `/files`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                const localVarFormParams = new ((configuration &&
                  configuration.formDataCtor) ||
                  FormData)();
                if (file !== undefined) {
                  localVarFormParams.append('file', file);
                }
                if (purpose !== undefined) {
                  localVarFormParams.append('purpose', purpose);
                }
                localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign(
                      Object.assign({}, localVarHeaderParameter),
                      localVarFormParams.getHeaders()
                    ),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = localVarFormParams;
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
             * @param {CreateFineTuneRequest} createFineTuneRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createFineTune: (createFineTuneRequest, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'createFineTuneRequest' is not null or undefined
                common_1.assertParamExists(
                  'createFineTune',
                  'createFineTuneRequest',
                  createFineTuneRequest
                );
                const localVarPath = `/fine-tunes`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                localVarHeaderParameter['Content-Type'] = 'application/json';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = common_1.serializeDataIfNeeded(
                  createFineTuneRequest,
                  localVarRequestOptions,
                  configuration
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Creates an image given a prompt.
             * @param {CreateImageRequest} createImageRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createImage: (createImageRequest, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'createImageRequest' is not null or undefined
                common_1.assertParamExists(
                  'createImage',
                  'createImageRequest',
                  createImageRequest
                );
                const localVarPath = `/images/generations`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                localVarHeaderParameter['Content-Type'] = 'application/json';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = common_1.serializeDataIfNeeded(
                  createImageRequest,
                  localVarRequestOptions,
                  configuration
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Creates an edited or extended image given an original image and a prompt.
             * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square.
             * @param {File} mask An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
             * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
             * @param {number} [n] The number of images to generate. Must be between 1 and 10.
             * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
             * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
             * @param {string} [user] A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createImageEdit: (
              image,
              mask,
              prompt,
              n,
              size,
              responseFormat,
              user,
              options = {}
            ) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'image' is not null or undefined
                common_1.assertParamExists('createImageEdit', 'image', image);
                // verify required parameter 'mask' is not null or undefined
                common_1.assertParamExists('createImageEdit', 'mask', mask);
                // verify required parameter 'prompt' is not null or undefined
                common_1.assertParamExists('createImageEdit', 'prompt', prompt);
                const localVarPath = `/images/edits`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                const localVarFormParams = new ((configuration &&
                  configuration.formDataCtor) ||
                  FormData)();
                if (image !== undefined) {
                  localVarFormParams.append('image', image);
                }
                if (mask !== undefined) {
                  localVarFormParams.append('mask', mask);
                }
                if (prompt !== undefined) {
                  localVarFormParams.append('prompt', prompt);
                }
                if (n !== undefined) {
                  localVarFormParams.append('n', n);
                }
                if (size !== undefined) {
                  localVarFormParams.append('size', size);
                }
                if (responseFormat !== undefined) {
                  localVarFormParams.append('response_format', responseFormat);
                }
                if (user !== undefined) {
                  localVarFormParams.append('user', user);
                }
                localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign(
                      Object.assign({}, localVarHeaderParameter),
                      localVarFormParams.getHeaders()
                    ),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = localVarFormParams;
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Creates a variation of a given image.
             * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
             * @param {number} [n] The number of images to generate. Must be between 1 and 10.
             * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
             * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
             * @param {string} [user] A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createImageVariation: (
              image,
              n,
              size,
              responseFormat,
              user,
              options = {}
            ) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'image' is not null or undefined
                common_1.assertParamExists(
                  'createImageVariation',
                  'image',
                  image
                );
                const localVarPath = `/images/variations`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                const localVarFormParams = new ((configuration &&
                  configuration.formDataCtor) ||
                  FormData)();
                if (image !== undefined) {
                  localVarFormParams.append('image', image);
                }
                if (n !== undefined) {
                  localVarFormParams.append('n', n);
                }
                if (size !== undefined) {
                  localVarFormParams.append('size', size);
                }
                if (responseFormat !== undefined) {
                  localVarFormParams.append('response_format', responseFormat);
                }
                if (user !== undefined) {
                  localVarFormParams.append('user', user);
                }
                localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign(
                      Object.assign({}, localVarHeaderParameter),
                      localVarFormParams.getHeaders()
                    ),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = localVarFormParams;
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Classifies if text violates OpenAI\'s Content Policy
             * @param {CreateModerationRequest} createModerationRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createModeration: (createModerationRequest, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'createModerationRequest' is not null or undefined
                common_1.assertParamExists(
                  'createModeration',
                  'createModerationRequest',
                  createModerationRequest
                );
                const localVarPath = `/moderations`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                localVarHeaderParameter['Content-Type'] = 'application/json';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = common_1.serializeDataIfNeeded(
                  createModerationRequest,
                  localVarRequestOptions,
                  configuration
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
             * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
             * @param {CreateSearchRequest} createSearchRequest
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            createSearch: (engineId, createSearchRequest, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'engineId' is not null or undefined
                common_1.assertParamExists(
                  'createSearch',
                  'engineId',
                  engineId
                );
                // verify required parameter 'createSearchRequest' is not null or undefined
                common_1.assertParamExists(
                  'createSearch',
                  'createSearchRequest',
                  createSearchRequest
                );
                const localVarPath = `/engines/{engine_id}/search`.replace(
                  `{${'engine_id'}}`,
                  encodeURIComponent(String(engineId))
                );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'POST' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                localVarHeaderParameter['Content-Type'] = 'application/json';
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                localVarRequestOptions.data = common_1.serializeDataIfNeeded(
                  createSearchRequest,
                  localVarRequestOptions,
                  configuration
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Delete a file.
             * @param {string} fileId The ID of the file to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            deleteFile: (fileId, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'fileId' is not null or undefined
                common_1.assertParamExists('deleteFile', 'fileId', fileId);
                const localVarPath = `/files/{file_id}`.replace(
                  `{${'file_id'}}`,
                  encodeURIComponent(String(fileId))
                );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'DELETE' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
             * @param {string} model The model to delete
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            deleteModel: (model, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'model' is not null or undefined
                common_1.assertParamExists('deleteModel', 'model', model);
                const localVarPath = `/models/{model}`.replace(
                  `{${'model'}}`,
                  encodeURIComponent(String(model))
                );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'DELETE' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Returns the contents of the specified file
             * @param {string} fileId The ID of the file to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            downloadFile: (fileId, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'fileId' is not null or undefined
                common_1.assertParamExists('downloadFile', 'fileId', fileId);
                const localVarPath = `/files/{file_id}/content`.replace(
                  `{${'file_id'}}`,
                  encodeURIComponent(String(fileId))
                );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            listEngines: (options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                const localVarPath = `/engines`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Returns a list of files that belong to the user\'s organization.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listFiles: (options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                const localVarPath = `/files`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Get fine-grained status updates for a fine-tune job.
             * @param {string} fineTuneId The ID of the fine-tune job to get events for.
             * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listFineTuneEvents: (fineTuneId, stream, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'fineTuneId' is not null or undefined
                common_1.assertParamExists(
                  'listFineTuneEvents',
                  'fineTuneId',
                  fineTuneId
                );
                const localVarPath =
                  `/fine-tunes/{fine_tune_id}/events`.replace(
                    `{${'fine_tune_id'}}`,
                    encodeURIComponent(String(fineTuneId))
                  );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                if (stream !== undefined) {
                  localVarQueryParameter['stream'] = stream;
                }
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary List your organization\'s fine-tuning jobs
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listFineTunes: (options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                const localVarPath = `/fine-tunes`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listModels: (options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                const localVarPath = `/models`;
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
             * @param {string} engineId The ID of the engine to use for this request
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            retrieveEngine: (engineId, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'engineId' is not null or undefined
                common_1.assertParamExists(
                  'retrieveEngine',
                  'engineId',
                  engineId
                );
                const localVarPath = `/engines/{engine_id}`.replace(
                  `{${'engine_id'}}`,
                  encodeURIComponent(String(engineId))
                );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Returns information about a specific file.
             * @param {string} fileId The ID of the file to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            retrieveFile: (fileId, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'fileId' is not null or undefined
                common_1.assertParamExists('retrieveFile', 'fileId', fileId);
                const localVarPath = `/files/{file_id}`.replace(
                  `{${'file_id'}}`,
                  encodeURIComponent(String(fileId))
                );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
             * @param {string} fineTuneId The ID of the fine-tune job
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            retrieveFineTune: (fineTuneId, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'fineTuneId' is not null or undefined
                common_1.assertParamExists(
                  'retrieveFineTune',
                  'fineTuneId',
                  fineTuneId
                );
                const localVarPath = `/fine-tunes/{fine_tune_id}`.replace(
                  `{${'fine_tune_id'}}`,
                  encodeURIComponent(String(fineTuneId))
                );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
            /**
             *
             * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
             * @param {string} model The ID of the model to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            retrieveModel: (model, options = {}) =>
              __awaiter(this, void 0, void 0, function* () {
                // verify required parameter 'model' is not null or undefined
                common_1.assertParamExists('retrieveModel', 'model', model);
                const localVarPath = `/models/{model}`.replace(
                  `{${'model'}}`,
                  encodeURIComponent(String(model))
                );
                // use dummy base URL string because the URL constructor only accepts absolute URLs.
                const localVarUrlObj = new URL(
                  localVarPath,
                  common_1.DUMMY_BASE_URL
                );
                let baseOptions;
                if (configuration) {
                  baseOptions = configuration.baseOptions;
                }
                const localVarRequestOptions = Object.assign(
                  Object.assign({ method: 'GET' }, baseOptions),
                  options
                );
                const localVarHeaderParameter = {};
                const localVarQueryParameter = {};
                common_1.setSearchParams(
                  localVarUrlObj,
                  localVarQueryParameter
                );
                let headersFromBaseOptions =
                  baseOptions && baseOptions.headers ? baseOptions.headers : {};
                localVarRequestOptions.headers = Object.assign(
                  Object.assign(
                    Object.assign({}, localVarHeaderParameter),
                    headersFromBaseOptions
                  ),
                  options.headers
                );
                return {
                  url: common_1.toPathString(localVarUrlObj),
                  options: localVarRequestOptions,
                };
              }),
          };
        };
        /**
         * OpenAIApi - functional programming interface
         * @export
         */
        exports.OpenAIApiFp = function (configuration) {
          const localVarAxiosParamCreator =
            exports.OpenAIApiAxiosParamCreator(configuration);
          return {
            /**
             *
             * @summary Immediately cancel a fine-tune job.
             * @param {string} fineTuneId The ID of the fine-tune job to cancel
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            cancelFineTune(fineTuneId, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.cancelFineTune(
                    fineTuneId,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
             * @param {CreateAnswerRequest} createAnswerRequest
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            createAnswer(createAnswerRequest, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createAnswer(
                    createAnswerRequest,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
             * @param {CreateClassificationRequest} createClassificationRequest
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            createClassification(createClassificationRequest, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createClassification(
                    createClassificationRequest,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Creates a completion for the provided prompt and parameters
             * @param {CreateCompletionRequest} createCompletionRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createCompletion(createCompletionRequest, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createCompletion(
                    createCompletionRequest,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Creates a new edit for the provided input, instruction, and parameters
             * @param {CreateEditRequest} createEditRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createEdit(createEditRequest, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createEdit(
                    createEditRequest,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Creates an embedding vector representing the input text.
             * @param {CreateEmbeddingRequest} createEmbeddingRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createEmbedding(createEmbeddingRequest, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createEmbedding(
                    createEmbeddingRequest,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
             * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
             * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createFile(file, purpose, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createFile(
                    file,
                    purpose,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
             * @param {CreateFineTuneRequest} createFineTuneRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createFineTune(createFineTuneRequest, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createFineTune(
                    createFineTuneRequest,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Creates an image given a prompt.
             * @param {CreateImageRequest} createImageRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createImage(createImageRequest, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createImage(
                    createImageRequest,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Creates an edited or extended image given an original image and a prompt.
             * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square.
             * @param {File} mask An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
             * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
             * @param {number} [n] The number of images to generate. Must be between 1 and 10.
             * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
             * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
             * @param {string} [user] A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createImageEdit(
              image,
              mask,
              prompt,
              n,
              size,
              responseFormat,
              user,
              options
            ) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createImageEdit(
                    image,
                    mask,
                    prompt,
                    n,
                    size,
                    responseFormat,
                    user,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Creates a variation of a given image.
             * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
             * @param {number} [n] The number of images to generate. Must be between 1 and 10.
             * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
             * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
             * @param {string} [user] A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createImageVariation(
              image,
              n,
              size,
              responseFormat,
              user,
              options
            ) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createImageVariation(
                    image,
                    n,
                    size,
                    responseFormat,
                    user,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Classifies if text violates OpenAI\'s Content Policy
             * @param {CreateModerationRequest} createModerationRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createModeration(createModerationRequest, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createModeration(
                    createModerationRequest,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
             * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
             * @param {CreateSearchRequest} createSearchRequest
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            createSearch(engineId, createSearchRequest, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.createSearch(
                    engineId,
                    createSearchRequest,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Delete a file.
             * @param {string} fileId The ID of the file to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            deleteFile(fileId, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.deleteFile(fileId, options);
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
             * @param {string} model The model to delete
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            deleteModel(model, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.deleteModel(model, options);
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Returns the contents of the specified file
             * @param {string} fileId The ID of the file to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            downloadFile(fileId, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.downloadFile(fileId, options);
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            listEngines(options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.listEngines(options);
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Returns a list of files that belong to the user\'s organization.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listFiles(options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.listFiles(options);
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Get fine-grained status updates for a fine-tune job.
             * @param {string} fineTuneId The ID of the fine-tune job to get events for.
             * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listFineTuneEvents(fineTuneId, stream, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.listFineTuneEvents(
                    fineTuneId,
                    stream,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary List your organization\'s fine-tuning jobs
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listFineTunes(options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.listFineTunes(options);
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listModels(options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.listModels(options);
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
             * @param {string} engineId The ID of the engine to use for this request
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            retrieveEngine(engineId, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.retrieveEngine(
                    engineId,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Returns information about a specific file.
             * @param {string} fileId The ID of the file to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            retrieveFile(fileId, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.retrieveFile(fileId, options);
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
             * @param {string} fineTuneId The ID of the fine-tune job
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            retrieveFineTune(fineTuneId, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.retrieveFineTune(
                    fineTuneId,
                    options
                  );
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
            /**
             *
             * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
             * @param {string} model The ID of the model to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            retrieveModel(model, options) {
              return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs =
                  yield localVarAxiosParamCreator.retrieveModel(model, options);
                return common_1.createRequestFunction(
                  localVarAxiosArgs,
                  axios_1.default,
                  base_1.BASE_PATH,
                  configuration
                );
              });
            },
          };
        };
        /**
         * OpenAIApi - factory interface
         * @export
         */
        exports.OpenAIApiFactory = function (configuration, basePath, axios) {
          const localVarFp = exports.OpenAIApiFp(configuration);
          return {
            /**
             *
             * @summary Immediately cancel a fine-tune job.
             * @param {string} fineTuneId The ID of the fine-tune job to cancel
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            cancelFineTune(fineTuneId, options) {
              return localVarFp
                .cancelFineTune(fineTuneId, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
             * @param {CreateAnswerRequest} createAnswerRequest
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            createAnswer(createAnswerRequest, options) {
              return localVarFp
                .createAnswer(createAnswerRequest, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
             * @param {CreateClassificationRequest} createClassificationRequest
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            createClassification(createClassificationRequest, options) {
              return localVarFp
                .createClassification(createClassificationRequest, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Creates a completion for the provided prompt and parameters
             * @param {CreateCompletionRequest} createCompletionRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createCompletion(createCompletionRequest, options) {
              return localVarFp
                .createCompletion(createCompletionRequest, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Creates a new edit for the provided input, instruction, and parameters
             * @param {CreateEditRequest} createEditRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createEdit(createEditRequest, options) {
              return localVarFp
                .createEdit(createEditRequest, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Creates an embedding vector representing the input text.
             * @param {CreateEmbeddingRequest} createEmbeddingRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createEmbedding(createEmbeddingRequest, options) {
              return localVarFp
                .createEmbedding(createEmbeddingRequest, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
             * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
             * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createFile(file, purpose, options) {
              return localVarFp
                .createFile(file, purpose, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
             * @param {CreateFineTuneRequest} createFineTuneRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createFineTune(createFineTuneRequest, options) {
              return localVarFp
                .createFineTune(createFineTuneRequest, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Creates an image given a prompt.
             * @param {CreateImageRequest} createImageRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createImage(createImageRequest, options) {
              return localVarFp
                .createImage(createImageRequest, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Creates an edited or extended image given an original image and a prompt.
             * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square.
             * @param {File} mask An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
             * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
             * @param {number} [n] The number of images to generate. Must be between 1 and 10.
             * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
             * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
             * @param {string} [user] A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createImageEdit(
              image,
              mask,
              prompt,
              n,
              size,
              responseFormat,
              user,
              options
            ) {
              return localVarFp
                .createImageEdit(
                  image,
                  mask,
                  prompt,
                  n,
                  size,
                  responseFormat,
                  user,
                  options
                )
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Creates a variation of a given image.
             * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
             * @param {number} [n] The number of images to generate. Must be between 1 and 10.
             * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
             * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
             * @param {string} [user] A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createImageVariation(
              image,
              n,
              size,
              responseFormat,
              user,
              options
            ) {
              return localVarFp
                .createImageVariation(
                  image,
                  n,
                  size,
                  responseFormat,
                  user,
                  options
                )
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Classifies if text violates OpenAI\'s Content Policy
             * @param {CreateModerationRequest} createModerationRequest
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            createModeration(createModerationRequest, options) {
              return localVarFp
                .createModeration(createModerationRequest, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
             * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
             * @param {CreateSearchRequest} createSearchRequest
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            createSearch(engineId, createSearchRequest, options) {
              return localVarFp
                .createSearch(engineId, createSearchRequest, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Delete a file.
             * @param {string} fileId The ID of the file to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            deleteFile(fileId, options) {
              return localVarFp
                .deleteFile(fileId, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
             * @param {string} model The model to delete
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            deleteModel(model, options) {
              return localVarFp
                .deleteModel(model, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Returns the contents of the specified file
             * @param {string} fileId The ID of the file to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            downloadFile(fileId, options) {
              return localVarFp
                .downloadFile(fileId, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            listEngines(options) {
              return localVarFp
                .listEngines(options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Returns a list of files that belong to the user\'s organization.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listFiles(options) {
              return localVarFp
                .listFiles(options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Get fine-grained status updates for a fine-tune job.
             * @param {string} fineTuneId The ID of the fine-tune job to get events for.
             * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listFineTuneEvents(fineTuneId, stream, options) {
              return localVarFp
                .listFineTuneEvents(fineTuneId, stream, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary List your organization\'s fine-tuning jobs
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listFineTunes(options) {
              return localVarFp
                .listFineTunes(options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            listModels(options) {
              return localVarFp
                .listModels(options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
             * @param {string} engineId The ID of the engine to use for this request
             * @param {*} [options] Override http request option.
             * @deprecated
             * @throws {RequiredError}
             */
            retrieveEngine(engineId, options) {
              return localVarFp
                .retrieveEngine(engineId, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Returns information about a specific file.
             * @param {string} fileId The ID of the file to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            retrieveFile(fileId, options) {
              return localVarFp
                .retrieveFile(fileId, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
             * @param {string} fineTuneId The ID of the fine-tune job
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            retrieveFineTune(fineTuneId, options) {
              return localVarFp
                .retrieveFineTune(fineTuneId, options)
                .then((request) => request(axios, basePath));
            },
            /**
             *
             * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
             * @param {string} model The ID of the model to use for this request
             * @param {*} [options] Override http request option.
             * @throws {RequiredError}
             */
            retrieveModel(model, options) {
              return localVarFp
                .retrieveModel(model, options)
                .then((request) => request(axios, basePath));
            },
          };
        };
        /**
         * OpenAIApi - object-oriented interface
         * @export
         * @class OpenAIApi
         * @extends {BaseAPI}
         */
        class OpenAIApi extends base_1.BaseAPI {
          /**
           *
           * @summary Immediately cancel a fine-tune job.
           * @param {string} fineTuneId The ID of the fine-tune job to cancel
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          cancelFineTune(fineTuneId, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .cancelFineTune(fineTuneId, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
           * @param {CreateAnswerRequest} createAnswerRequest
           * @param {*} [options] Override http request option.
           * @deprecated
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createAnswer(createAnswerRequest, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createAnswer(createAnswerRequest, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
           * @param {CreateClassificationRequest} createClassificationRequest
           * @param {*} [options] Override http request option.
           * @deprecated
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createClassification(createClassificationRequest, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createClassification(createClassificationRequest, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Creates a completion for the provided prompt and parameters
           * @param {CreateCompletionRequest} createCompletionRequest
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createCompletion(createCompletionRequest, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createCompletion(createCompletionRequest, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Creates a new edit for the provided input, instruction, and parameters
           * @param {CreateEditRequest} createEditRequest
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createEdit(createEditRequest, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createEdit(createEditRequest, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Creates an embedding vector representing the input text.
           * @param {CreateEmbeddingRequest} createEmbeddingRequest
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createEmbedding(createEmbeddingRequest, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createEmbedding(createEmbeddingRequest, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
           * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
           * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createFile(file, purpose, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createFile(file, purpose, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
           * @param {CreateFineTuneRequest} createFineTuneRequest
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createFineTune(createFineTuneRequest, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createFineTune(createFineTuneRequest, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Creates an image given a prompt.
           * @param {CreateImageRequest} createImageRequest
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createImage(createImageRequest, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createImage(createImageRequest, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Creates an edited or extended image given an original image and a prompt.
           * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square.
           * @param {File} mask An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
           * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
           * @param {number} [n] The number of images to generate. Must be between 1 and 10.
           * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
           * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
           * @param {string} [user] A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createImageEdit(
            image,
            mask,
            prompt,
            n,
            size,
            responseFormat,
            user,
            options
          ) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createImageEdit(
                image,
                mask,
                prompt,
                n,
                size,
                responseFormat,
                user,
                options
              )
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Creates a variation of a given image.
           * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
           * @param {number} [n] The number of images to generate. Must be between 1 and 10.
           * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
           * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
           * @param {string} [user] A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createImageVariation(image, n, size, responseFormat, user, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createImageVariation(
                image,
                n,
                size,
                responseFormat,
                user,
                options
              )
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Classifies if text violates OpenAI\'s Content Policy
           * @param {CreateModerationRequest} createModerationRequest
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createModeration(createModerationRequest, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createModeration(createModerationRequest, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
           * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
           * @param {CreateSearchRequest} createSearchRequest
           * @param {*} [options] Override http request option.
           * @deprecated
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          createSearch(engineId, createSearchRequest, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .createSearch(engineId, createSearchRequest, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Delete a file.
           * @param {string} fileId The ID of the file to use for this request
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          deleteFile(fileId, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .deleteFile(fileId, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
           * @param {string} model The model to delete
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          deleteModel(model, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .deleteModel(model, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Returns the contents of the specified file
           * @param {string} fileId The ID of the file to use for this request
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          downloadFile(fileId, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .downloadFile(fileId, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
           * @param {*} [options] Override http request option.
           * @deprecated
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          listEngines(options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .listEngines(options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Returns a list of files that belong to the user\'s organization.
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          listFiles(options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .listFiles(options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Get fine-grained status updates for a fine-tune job.
           * @param {string} fineTuneId The ID of the fine-tune job to get events for.
           * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          listFineTuneEvents(fineTuneId, stream, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .listFineTuneEvents(fineTuneId, stream, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary List your organization\'s fine-tuning jobs
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          listFineTunes(options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .listFineTunes(options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          listModels(options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .listModels(options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
           * @param {string} engineId The ID of the engine to use for this request
           * @param {*} [options] Override http request option.
           * @deprecated
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          retrieveEngine(engineId, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .retrieveEngine(engineId, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Returns information about a specific file.
           * @param {string} fileId The ID of the file to use for this request
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          retrieveFile(fileId, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .retrieveFile(fileId, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
           * @param {string} fineTuneId The ID of the fine-tune job
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          retrieveFineTune(fineTuneId, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .retrieveFineTune(fineTuneId, options)
              .then((request) => request(this.axios, this.basePath));
          }
          /**
           *
           * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
           * @param {string} model The ID of the model to use for this request
           * @param {*} [options] Override http request option.
           * @throws {RequiredError}
           * @memberof OpenAIApi
           */
          retrieveModel(model, options) {
            return exports
              .OpenAIApiFp(this.configuration)
              .retrieveModel(model, options)
              .then((request) => request(this.axios, this.basePath));
          }
        }
        exports.OpenAIApi = OpenAIApi;
      },
      { './base': 34, './common': 35, axios: 2 },
    ],
    34: [
      function (require, module, exports) {
        'use strict';
        /* tslint:disable */
        /* eslint-disable */
        /**
         * OpenAI API
         * APIs for sampling from and fine-tuning language models
         *
         * The version of the OpenAPI document: 1.1.0
         *
         *
         * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
         * https://openapi-generator.tech
         * Do not edit the class manually.
         */
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.RequiredError =
          exports.BaseAPI =
          exports.COLLECTION_FORMATS =
          exports.BASE_PATH =
            void 0;
        // Some imports not used depending on template conditions
        // @ts-ignore
        const axios_1 = require('axios');
        exports.BASE_PATH = 'https://api.openai.com/v1'.replace(/\/+$/, '');
        /**
         *
         * @export
         */
        exports.COLLECTION_FORMATS = {
          csv: ',',
          ssv: ' ',
          tsv: '\t',
          pipes: '|',
        };
        /**
         *
         * @export
         * @class BaseAPI
         */
        class BaseAPI {
          constructor(
            configuration,
            basePath = exports.BASE_PATH,
            axios = axios_1.default
          ) {
            this.basePath = basePath;
            this.axios = axios;
            if (configuration) {
              this.configuration = configuration;
              this.basePath = configuration.basePath || this.basePath;
            }
          }
        }
        exports.BaseAPI = BaseAPI;
        /**
         *
         * @export
         * @class RequiredError
         * @extends {Error}
         */
        class RequiredError extends Error {
          constructor(field, msg) {
            super(msg);
            this.field = field;
            this.name = 'RequiredError';
          }
        }
        exports.RequiredError = RequiredError;
      },
      { axios: 2 },
    ],
    35: [
      function (require, module, exports) {
        'use strict';
        /* tslint:disable */
        /* eslint-disable */
        /**
         * OpenAI API
         * APIs for sampling from and fine-tuning language models
         *
         * The version of the OpenAPI document: 1.1.0
         *
         *
         * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
         * https://openapi-generator.tech
         * Do not edit the class manually.
         */
        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.createRequestFunction =
          exports.toPathString =
          exports.serializeDataIfNeeded =
          exports.setSearchParams =
          exports.setOAuthToObject =
          exports.setBearerAuthToObject =
          exports.setBasicAuthToObject =
          exports.setApiKeyToObject =
          exports.assertParamExists =
          exports.DUMMY_BASE_URL =
            void 0;
        const base_1 = require('./base');
        /**
         *
         * @export
         */
        exports.DUMMY_BASE_URL = 'https://example.com';
        /**
         *
         * @throws {RequiredError}
         * @export
         */
        exports.assertParamExists = function (
          functionName,
          paramName,
          paramValue
        ) {
          if (paramValue === null || paramValue === undefined) {
            throw new base_1.RequiredError(
              paramName,
              `Required parameter ${paramName} was null or undefined when calling ${functionName}.`
            );
          }
        };
        /**
         *
         * @export
         */
        exports.setApiKeyToObject = function (
          object,
          keyParamName,
          configuration
        ) {
          return __awaiter(this, void 0, void 0, function* () {
            if (configuration && configuration.apiKey) {
              const localVarApiKeyValue =
                typeof configuration.apiKey === 'function'
                  ? yield configuration.apiKey(keyParamName)
                  : yield configuration.apiKey;
              object[keyParamName] = localVarApiKeyValue;
            }
          });
        };
        /**
         *
         * @export
         */
        exports.setBasicAuthToObject = function (object, configuration) {
          if (
            configuration &&
            (configuration.username || configuration.password)
          ) {
            object['auth'] = {
              username: configuration.username,
              password: configuration.password,
            };
          }
        };
        /**
         *
         * @export
         */
        exports.setBearerAuthToObject = function (object, configuration) {
          return __awaiter(this, void 0, void 0, function* () {
            if (configuration && configuration.accessToken) {
              const accessToken =
                typeof configuration.accessToken === 'function'
                  ? yield configuration.accessToken()
                  : yield configuration.accessToken;
              object['Authorization'] = 'Bearer ' + accessToken;
            }
          });
        };
        /**
         *
         * @export
         */
        exports.setOAuthToObject = function (
          object,
          name,
          scopes,
          configuration
        ) {
          return __awaiter(this, void 0, void 0, function* () {
            if (configuration && configuration.accessToken) {
              const localVarAccessTokenValue =
                typeof configuration.accessToken === 'function'
                  ? yield configuration.accessToken(name, scopes)
                  : yield configuration.accessToken;
              object['Authorization'] = 'Bearer ' + localVarAccessTokenValue;
            }
          });
        };
        function setFlattenedQueryParams(urlSearchParams, parameter, key = '') {
          if (typeof parameter === 'object') {
            if (Array.isArray(parameter)) {
              parameter.forEach((item) =>
                setFlattenedQueryParams(urlSearchParams, item, key)
              );
            } else {
              Object.keys(parameter).forEach((currentKey) =>
                setFlattenedQueryParams(
                  urlSearchParams,
                  parameter[currentKey],
                  `${key}${key !== '' ? '.' : ''}${currentKey}`
                )
              );
            }
          } else {
            if (urlSearchParams.has(key)) {
              urlSearchParams.append(key, parameter);
            } else {
              urlSearchParams.set(key, parameter);
            }
          }
        }
        /**
         *
         * @export
         */
        exports.setSearchParams = function (url, ...objects) {
          const searchParams = new URLSearchParams(url.search);
          setFlattenedQueryParams(searchParams, objects);
          url.search = searchParams.toString();
        };
        /**
         *
         * @export
         */
        exports.serializeDataIfNeeded = function (
          value,
          requestOptions,
          configuration
        ) {
          const nonString = typeof value !== 'string';
          const needsSerialization =
            nonString && configuration && configuration.isJsonMime
              ? configuration.isJsonMime(requestOptions.headers['Content-Type'])
              : nonString;
          return needsSerialization
            ? JSON.stringify(value !== undefined ? value : {})
            : value || '';
        };
        /**
         *
         * @export
         */
        exports.toPathString = function (url) {
          return url.pathname + url.search + url.hash;
        };
        /**
         *
         * @export
         */
        exports.createRequestFunction = function (
          axiosArgs,
          globalAxios,
          BASE_PATH,
          configuration
        ) {
          return (axios = globalAxios, basePath = BASE_PATH) => {
            const axiosRequestArgs = Object.assign(
              Object.assign({}, axiosArgs.options),
              {
                url:
                  ((configuration === null || configuration === void 0
                    ? void 0
                    : configuration.basePath) || basePath) + axiosArgs.url,
              }
            );
            return axios.request(axiosRequestArgs);
          };
        };
      },
      { './base': 34 },
    ],
    36: [
      function (require, module, exports) {
        'use strict';
        /* tslint:disable */
        /* eslint-disable */
        /**
         * OpenAI API
         * APIs for sampling from and fine-tuning language models
         *
         * The version of the OpenAPI document: 1.1.0
         *
         *
         * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
         * https://openapi-generator.tech
         * Do not edit the class manually.
         */
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.Configuration = void 0;
        const packageJson = require('../package.json');
        class Configuration {
          constructor(param = {}) {
            this.apiKey = param.apiKey;
            this.organization = param.organization;
            this.username = param.username;
            this.password = param.password;
            this.accessToken = param.accessToken;
            this.basePath = param.basePath;
            this.baseOptions = param.baseOptions;
            this.formDataCtor = param.formDataCtor;
            if (!this.baseOptions) {
              this.baseOptions = {};
            }
            this.baseOptions.headers = Object.assign(
              {
                'User-Agent': `OpenAI/NodeJS/${packageJson.version}`,
                Authorization: `Bearer ${this.apiKey}`,
              },
              this.baseOptions.headers
            );
            if (this.organization) {
              this.baseOptions.headers['OpenAI-Organization'] =
                this.organization;
            }
            if (!this.formDataCtor) {
              this.formDataCtor = require('form-data');
            }
          }
          /**
           * Check if the given MIME is a JSON MIME.
           * JSON MIME examples:
           *   application/json
           *   application/json; charset=UTF8
           *   APPLICATION/JSON
           *   application/vnd.company+json
           * @param mime - MIME (Multipurpose Internet Mail Extensions)
           * @return True if the given MIME is JSON, false otherwise.
           */
          isJsonMime(mime) {
            const jsonMime = new RegExp(
              '^(application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(;.*)?$',
              'i'
            );
            return (
              mime !== null &&
              (jsonMime.test(mime) ||
                mime.toLowerCase() === 'application/json-patch+json')
            );
          }
        }
        exports.Configuration = Configuration;
      },
      { '../package.json': 38, 'form-data': 32 },
    ],
    37: [
      function (require, module, exports) {
        'use strict';
        /* tslint:disable */
        /* eslint-disable */
        /**
         * OpenAI API
         * APIs for sampling from and fine-tuning language models
         *
         * The version of the OpenAPI document: 1.1.0
         *
         *
         * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
         * https://openapi-generator.tech
         * Do not edit the class manually.
         */
        var __createBinding =
          (this && this.__createBinding) ||
          (Object.create
            ? function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  },
                });
              }
            : function (o, m, k, k2) {
                if (k2 === undefined) k2 = k;
                o[k2] = m[k];
              });
        var __exportStar =
          (this && this.__exportStar) ||
          function (m, exports) {
            for (var p in m)
              if (p !== 'default' && !exports.hasOwnProperty(p))
                __createBinding(exports, m, p);
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        __exportStar(require('./api'), exports);
        __exportStar(require('./configuration'), exports);
      },
      { './api': 33, './configuration': 36 },
    ],
    38: [
      function (require, module, exports) {
        module.exports = {
          name: 'openai',
          version: '3.1.0',
          description: 'Node.js library for the OpenAI API',
          repository: {
            type: 'git',
            url: 'git@github.com:openai/openai-node.git',
          },
          keywords: ['openai', 'open', 'ai', 'gpt-3', 'gpt3'],
          author: 'OpenAI',
          license: 'MIT',
          main: './dist/index.js',
          types: './dist/index.d.ts',
          scripts: {
            build: 'tsc --outDir dist/',
          },
          dependencies: {
            axios: '^0.26.0',
            'form-data': '^4.0.0',
          },
          devDependencies: {
            '@types/node': '^12.11.5',
            typescript: '^3.6.4',
          },
        };
      },
      {},
    ],
    39: [
      function (require, module, exports) {
        // shim for using process in browser
        var process = (module.exports = {});

        // cached from whatever global is present so that test runners that stub it
        // don't break things.  But we need to wrap it in a try catch in case it is
        // wrapped in strict mode code which doesn't define any globals.  It's inside a
        // function because try/catches deoptimize in certain engines.

        var cachedSetTimeout;
        var cachedClearTimeout;

        function defaultSetTimout() {
          throw new Error('setTimeout has not been defined');
        }
        function defaultClearTimeout() {
          throw new Error('clearTimeout has not been defined');
        }
        (function () {
          try {
            if (typeof setTimeout === 'function') {
              cachedSetTimeout = setTimeout;
            } else {
              cachedSetTimeout = defaultSetTimout;
            }
          } catch (e) {
            cachedSetTimeout = defaultSetTimout;
          }
          try {
            if (typeof clearTimeout === 'function') {
              cachedClearTimeout = clearTimeout;
            } else {
              cachedClearTimeout = defaultClearTimeout;
            }
          } catch (e) {
            cachedClearTimeout = defaultClearTimeout;
          }
        })();
        function runTimeout(fun) {
          if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
          }
          // if setTimeout wasn't available but was latter defined
          if (
            (cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
            setTimeout
          ) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
          }
          try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
          } catch (e) {
            try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
            } catch (e) {
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
            }
          }
        }
        function runClearTimeout(marker) {
          if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
          }
          // if clearTimeout wasn't available but was latter defined
          if (
            (cachedClearTimeout === defaultClearTimeout ||
              !cachedClearTimeout) &&
            clearTimeout
          ) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
          }
          try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
          } catch (e) {
            try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
            } catch (e) {
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
            }
          }
        }
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
          if (!draining || !currentQueue) {
            return;
          }
          draining = false;
          if (currentQueue.length) {
            queue = currentQueue.concat(queue);
          } else {
            queueIndex = -1;
          }
          if (queue.length) {
            drainQueue();
          }
        }

        function drainQueue() {
          if (draining) {
            return;
          }
          var timeout = runTimeout(cleanUpNextTick);
          draining = true;

          var len = queue.length;
          while (len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
              if (currentQueue) {
                currentQueue[queueIndex].run();
              }
            }
            queueIndex = -1;
            len = queue.length;
          }
          currentQueue = null;
          draining = false;
          runClearTimeout(timeout);
        }

        process.nextTick = function (fun) {
          var args = new Array(arguments.length - 1);
          if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
            }
          }
          queue.push(new Item(fun, args));
          if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
          }
        };

        // v8 likes predictible objects
        function Item(fun, array) {
          this.fun = fun;
          this.array = array;
        }
        Item.prototype.run = function () {
          this.fun.apply(null, this.array);
        };
        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = ''; // empty string to avoid regexp issues
        process.versions = {};

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.prependListener = noop;
        process.prependOnceListener = noop;

        process.listeners = function (name) {
          return [];
        };

        process.binding = function (name) {
          throw new Error('process.binding is not supported');
        };

        process.cwd = function () {
          return '/';
        };
        process.chdir = function (dir) {
          throw new Error('process.chdir is not supported');
        };
        process.umask = function () {
          return 0;
        };
      },
      {},
    ],
  },
  {},
  [1]
);
