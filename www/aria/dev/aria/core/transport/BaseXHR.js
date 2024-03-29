/*
 * Copyright Amadeus
 */
/**
 * Transport class for XHR requests. This is the base implementation and is shared between all transports that use
 * XMLHttpRequest
 */
Aria.classDefinition({
    $classpath : "aria.core.transport.BaseXHR",
    $implements : ["aria.core.transport.ITransports"],
    $prototype : {
        /**
         * Polling interval for the handle ready state in milliseconds.
         * @type Number
         * @protected
         */
        _pollingInterval : 50,

        /**
         * Tells if the transport object is ready or requires an initialization phase
         * @type Boolean
         */
        isReady : true,

        /**
         * Initialization function. Not needed because this transport is ready at creation time
         */
        init : Aria.empty,

        /**
         * Perform a request.
         * @param {aria.core.CfgBeans.IOAsyncRequestCfg} request Request object
         * @param {aria.core.CfgBeans.Callback} callback This callback is generated by IO so it's already normalized
         * @throws
         */
        request : function (request, callback) {
            var connection = this._getConnection();

            connection.open(request.method, request.url, true);

            for (var header in request.headers) {
                if (request.headers.hasOwnProperty(header)) {
                    connection.setRequestHeader(header, request.headers[header]);
                }
            }

            // Timer for aborting the request after a timeout
            aria.core.IO.setTimeout(request.id, request.timeout, {
                fn : this.onAbort,
                scope : this,
                args : [request.id, connection]
            });

            this._handleReadyState(request.id, connection, callback);

            // This might throw an error, propagate it and let the IO know that there was an exception
            connection.send(request.data || null);
        },

        /**
         * Get a connection object.
         * @return {Object} connection object
         * @protected
         */
        _getConnection : function () {
            return this._standardXHR() || this._activeX();
        },

        /**
         * Get a standard XMLHttpRequest connection object
         * @return {XMLHttpRequest} connection object
         * @protected
         */
        _standardXHR : function () {
            try {
                var XMLHttpRequest = Aria.$global.XMLHttpRequest;
                return new XMLHttpRequest();
            } catch (ex) {}
        },

        /**
         * Get an ActiveXObject connection object
         * @return {ActiveXObject} connection object
         * @protected
         */
        _activeX : function () {
            try {
                var ActiveXObject = Aria.$global.ActiveXObject;
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (ex) {}
        },

        /**
         * A timer that polls the XHR object's readyState property during a transaction, instead of binding a
         * callback to the onreadystatechange event. Upon readyState 4, handleTransactionResponse will process the
         * response, and the timer will be cleared.
         * @param {Number} reqId Requst identifier
         * @param {Object} connection The connection object (XHR or ActiveX)
         * @param {aria.core.CfgBeans.Callback} callback Callback from aria.core.IO
         * @private
         */
        _handleReadyState : function (reqId, connection, callback) {
            var ariaIO = aria.core.IO;

            // Interval for processing the response from the server
            var scope = this;
            ariaIO._poll[reqId] = setInterval(function () {
                if (connection && connection.readyState === 4) {
                    aria.core.IO.clearTimeout(reqId);

                    clearInterval(ariaIO._poll[reqId]);
                    delete ariaIO._poll[reqId];

                    scope._handleTransactionResponse(reqId, connection, callback);
                }
            }, this._pollingInterval);
        },

        /**
         * Attempts to interpret the server response and determine whether the transaction was successful, or if an
         * error or exception was encountered.
         * @private
         * @param {Number} reqId Requst identifier
         * @param {Object} connection The connection object (XHR or ActiveX)
         * @param {aria.core.CfgBeans.Callback} callback Callback from aria.core.IO
         */
        _handleTransactionResponse : function (reqId, connection, callback) {
            var httpStatus, responseObject;

            try {
                var connectionStatus = connection.status;
                if (connectionStatus) {
                    httpStatus = connectionStatus || 200;
                } else if (!connectionStatus && connection.responseText) {
                    // Local requests done with ActiveX have undefined state
                    // consider it successfull if it has a response text
                    httpStatus = 200;
                } else if (connectionStatus == 1223) {
                    // Sometimes IE returns 1223 instead of 204
                    httpStatus = 204;
                } else {
                    httpStatus = 13030;
                }
            } catch (e) {
                // 13030 is a custom code to indicate the condition -- in Mozilla/FF --
                // when the XHR object's status and statusText properties are
                // unavailable, and a query attempt throws an exception.
                httpStatus = 13030;
            }

            var error = false;
            if (httpStatus >= 200 && httpStatus < 300) {
                responseObject = this._createResponse(connection);
            } else {
                responseObject = {
                    error : [httpStatus, connection.statusText].join(" "),
                    responseText : connection.responseText,
                    responseXML : connection.responseXML
                };

                error = true;
            }

            responseObject.status = httpStatus;

            callback.fn.call(callback.scope, error, callback.args, responseObject);

            connection = null;
            responseObject = null;
        },

        /**
         * Generate a valid server response.
         * @protected
         * @param {Object} connection Connection status
         * @return {aria.core.CfgBeans.IOAsyncRequestResponseCfg}
         */
        _createResponse : function (connection) {
            var headerStr = connection.getAllResponseHeaders(), headers = {};

            if (headerStr) {
                var headerLines = headerStr.split("\n");
                for (var i = 0; i < headerLines.length; i++) {
                    var delimitPos = headerLines[i].indexOf(":");
                    if (delimitPos != -1) {
                        // Trime headers
                        headers[headerLines[i].substring(0, delimitPos)] = headerLines[i].substring(delimitPos + 2).replace(/^\s+|\s+$/g, "");
                    }
                }
            }

            var response = {
                statusText : (connection.status == 1223) ? "No Content" : connection.statusText,
                getResponseHeader : headers,
                getAllResponseHeaders : headerLines,
                responseText : connection.responseText,
                responseXML : connection.responseXML
            };

            return response;
        },

        /**
         * Abort method. Called after the request timeout
         * @param {Number} reqId Request identifier
         * @param {Object} connection
         * @return {Boolean} Whether the connection was aborted or not
         */
        onAbort : function (reqId, connection) {
            clearInterval(aria.core.IO._poll[reqId]);
            delete aria.core.IO._poll[reqId];

            if (this._inProgress(connection)) {
                connection.abort();
                return true;
            } // else the request completed but after the abort timeout (it happens in IE)

            return false;
        },

        /**
         * Determines if the transaction is still being processed by checking the readyState of the connection
         * @param {Object} connection Connection object
         * @return {Boolean}
         * @private
         */
        _inProgress : function (connection) {
            return connection.readyState !== 4 && connection.readyState !== 0;
        }
    }
});