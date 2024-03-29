/*
 * Copyright Amadeus
 */
(function () {
    var console = Aria.$global.console;

    /**
     * Returns an array describing the first difference between an object and another. The second object defines the
     * properties the first one must have with the same values (recursively).
     * @private
     */
    var diffObjects = function (evt, expectedEvt) {
        if (evt === expectedEvt)
            return null;
        if (typeof(expectedEvt) != typeof(evt))
            return [];
        if (typeof(expectedEvt) == 'object' || typeof(expectedEvt) == 'array') {
            for (var i in expectedEvt) {
                var res = diffObjects(evt[i], expectedEvt[i]);
                if (res != null) {
                    res.unshift(i);
                    return res;
                }
            }
        } else if (evt != expectedEvt) {
            return [];
        }
        return null;
    };

    /**
     * Base class gathering all assertions used in Test case classes
     */
    Aria.classDefinition({
        $classpath : "aria.jsunit.Assert",
        $extends : "aria.jsunit.Test",
        $statics : {
            ERROR_TYPES : {
                ERROR : "error",
                FAILURE : "failure"
            }
        },
        $dependencies : ["aria.core.log.SilentArrayAppender", "aria.core.Log"],
        $constructor : function () {
            // constructor
            this.$Test.constructor.call(this);
            this._currentTestName = '';

            // Asserts
            this._assertCount = 0;
            this._totalAssertCount = 0;

            this._overriddenClasses = null;

            // Events
            this._expectedEventsList = null;
            this._eventIndexInList = 0;
            this.evtLogs = []

            aria.core.Log.clearAppenders();
            aria.core.Log.addAppender(new aria.core.log.SilentArrayAppender());

            aria.core.Log.resetLoggingLevels();
            aria.core.Log.setLoggingLevel("*", 1);
        },
        $destructor : function () {
            this._expectedEventsList = null;
            this.$Test.$destructor.call(this);

            // appenders are cleared after the destroy so we can check for error in $dipose
        },
        $prototype : {
            /**
             * Name associated to internal exceptions used to stop a test execution
             * @type String
             */
            ASSERT_FAILURE : "Assert Failure",

            /**
             * Initialize the object and set logs in silent mode - must be called before the test is run
             * @private
             */
            _startTest : function (tc) {
                this.$Test._startTest.call(this);
                this._totalAssertCount = 0;

                this.$raiseEvent({
                    name : "start",
                    testObject : this,
                    testClass : this.$classpath
                });
            },

            /**
             * Reset the object and notify the end of the test to the listener
             * @private
             */
            _endTest : function () {
                this.$Test._endTest.call(this);
                this.checkExpectedEventListEnd();
                this.resetClassOverrides();
                this.assertLogsEmpty(false, false);
                this._assertCount = 0;
                this._currentTestName = '';

                this._isFinished = true;

                this.$raiseEvent({
                    name : "end",
                    testObject : this,
                    testClass : this.$classpath,
                    nbrOfAsserts : this._totalAssertCount
                });
            },

            /**
             * Update the current info used by the Assert method when loggin a failure or an error
             * @param {String} testName
             * @private
             */
            _updateAssertInfo : function (testName) {
                this._assertCount = 0;
                this._currentTestName = testName;
                this.$raiseEvent({
                    name : "stateChange",
                    testClass : this.$classpath,
                    testState : this._currentTestName
                });
            },

            /**
             * Check that value is true - if not a failure will be raised in the test context
             * @param {Boolean} value the value to test
             * @param {String} optMsg optional message to add to the failure description
             */
            assertTrue : function (value, optMsg) {
                this._assertCount++;
                this._totalAssertCount++;
                if (value !== true) {
                    var msg = "Assert #" + this._assertCount + " failed";
                    if (optMsg) {
                        msg += " : " + optMsg;
                    }

                    this.raiseFailure(msg);

                    if (console && aria.utils.Type.isFunction(console.trace)) {
                        console.assert(false, "Stack trace for failed Assert #" + this._assertCount + " in test : ["
                                + this._currentTestName + "]");
                    }

                    // raise an exception to stop subsequent
                    throw {
                        name : this.ASSERT_FAILURE,
                        message : msg
                    };
                }
            },

            /**
             * Check that value is false
             * @param {Boolean} value the value to test
             * @param {String} optMsg optional message to add to the failure description
             */
            assertFalse : function (value, optMsg) {
                this.assertTrue((value === false), optMsg || ("Expected false. Got : " + value));
            },

            /**
             * AssertEquals: Check that value1 is equal to value2
             * @param {object} value1 the value to compare
             * @param {object} value2 the value to compare
             * @param {String} optMsg optional message to add to the failure description
             */
            assertEquals : function (value1, value2, optMsg) {
                this.assertTrue((value1 === value2), optMsg || ("Expected : " + value1 + ". Got : " + value2));
            },

            /**
             * AssertNotEquals: Check that value1 is not! equal to value2
             * @param {object} value1 the value to compare
             * @param {object} value2 the value to compare
             * @param {String} optMsg optional message to add to the failure description
             */
            assertNotEquals : function (value1, value2, optMsg) {
                this.assertTrue((value1 !== value2), optMsg || ("Expected : " + value1 + ". Got : " + value2));
            },

            /**
             * Assert that the current log stack is empty If not, each log error is considered as a failure. Once
             * called, log list is emptied (and non-error messages will be discarded)
             * @param {Boolean} raiseException if true (default) an exception will be raised to stop the current test
             * execution
             * @param {Boolean} countAsAssert (default: true) if false, calling this method will not increment the
             * asserts counter (which it would do by default)
             */
            assertLogsEmpty : function (raiseException, countAsAssert) {
                if (countAsAssert !== false) {
                    this._assertCount++;
                    this._totalAssertCount++;
                }
                var logAppender = aria.core.Log.getAppenders()[0];

                if (!logAppender.isEmpty()) {
                    var logs = logAppender.getLogs(), errFound = false, msg = '';

                    for (var i = 0; i < logs.length; i++) {
                        var logItem = logs[i];
                        if (logItem.level == "error") {
                            errFound = true;
                            msg = "Uncaught error detected: [" + logItem.className + "] " + logItem.msg;

                            if (logItem.objOrErr && console && aria.utils.Type.isFunction(console.error)) {
                                console.error(this.$classpath + "." + this._currentTestName + ": " + msg, logItem.objOrErr);
                            }

                            this.raiseFailure(msg);
                        }
                    }

                    logAppender.empty();

                    if (errFound && raiseException !== false) {
                        throw {
                            name : this.ASSERT_FAILURE,
                            message : msg
                            // last message is used in this case
                        };
                    }
                }
            },

            /**
             * Asserts that an error should be present in the logs at least 'count' number of times. Once called,
             * 'count' occurrences of the error will be discarded. If the parameter 'count' is not present, all
             * occurrences will be removed.
             * @param {String} errorMsg Must not be null or undefined
             * @param {Number} count [optional] number of times the error must be present in the logs
             */
            assertErrorInLogs : function (errorMsg, count) {
                var logAppender = aria.core.Log.getAppenders()[0];
                var logs = logAppender.getLogs(), errFound = false, newLogs = [];
                if (errorMsg == null) {
                    this.assertTrue(false, "assertErrorInLogs was called with a null error message.");
                }
                if (count && count > 0) {
                    var localCount = 0;
                    for (var i = 0; logs.length > i; i++) {
                        if (localCount < count && logs[i].msgId == errorMsg) {
                            localCount++;
                        } else {
                            newLogs.push(logs[i]);
                        }
                    }
                    logAppender.setLogs(newLogs);
                    this.assertTrue(localCount == count, "Expected error " + errorMsg + " found " + localCount
                            + " times in logs");
                } else {
                    for (var i = 0; logs.length > i; i++) {
                        if (logs[i].msgId == errorMsg) {
                            errFound = true;
                        } else {
                            newLogs.push(logs[i]);
                        }
                    }
                    logAppender.setLogs(newLogs);
                    this.assertTrue(errFound, "Expected error not found in logs: " + errorMsg);
                }
            },

            /**
             * Asserts that a JSON structure is contained inside another
             * @param {Object} bigJ the container structure
             * @param {Object} smallJ the contained structure
             */
            assertJsonContains : function (bigJ, smallJ, optMsg) {
                this.assertTrue(aria.utils.Json.contains(bigJ, smallJ), optMsg);
            },

            /**
             * Asserts that a JSON structure is equal to another. Contrarily to the basic assertEquals method, this
             * assert will recursively traverse the object to compare its content. <code>
             *         var obj1 = {a:"a", b:0};
             *         var obj2 = {a:"a", b:0};
             *         this.assertJsonEquals(obj1, obj2); // will succeed
             *         this.assertEquals(obj1, obj2); // will fail
             * </code>
             * @param {Object} obj1 the first structure
             * @param {Object} obj2 the other structure
             * @param {String} optMsg optional message to add to the failure description
             */
            assertJsonEquals : function (obj1, obj2, optMsg) {
                this.assertTrue(aria.utils.Json.equals(obj1, obj2), optMsg);
            },

            /**
             * Asserts that a JSON structure is different from another. Contrarily to the basic assertNotEquals method,
             * this assert will recursively traverse the object to compare its content. <code>
             *         var obj1 = {a:"a", b:0};
             *         var obj2 = {a:"a", b:0};
             *         this.assertJsonNotEquals(obj1, obj2); // will fail
             *         this.assertNotEquals(obj1, obj2); // will succeed
             * </code>
             * @param {Object} obj1 the first structure
             * @param {Object} obj2 the other structure
             * @param {String} optMsg optional message to add to the failure description
             */
            assertJsonNotEquals : function (obj1, obj2, optMsg) {
                this.assertFalse(aria.utils.Json.equals(obj1, obj2), optMsg);
            },

            /**
             * Force failure (e.g. when a test is not completely implemented
             * @param {String} optMsg optional message to add to the failure description
             */
            fail : function (optMsg) {
                var msg = "Forced Failure";
                if (optMsg) {
                    msg += " (" + optMsg + ")";
                }

                this.raiseFailure(msg);

                // raise an exception to stop subsequent assertions
                throw {
                    name : this.ASSERT_FAILURE,
                    message : msg
                };
            },

            /**
             * Check if this test has any error
             * @return {Boolean}
             */
            hasError : function () {
                return this.getErrors().length > 0;
            },

            /**
             * Retrieve all errors associated to this test. This will retrieve both execution errors AND failures See
             * getExecutionErrors and getFailures
             * @return {Array}
             */
            getErrors : function () {
                return this._errors;
            },

            hasWarning : function () {
                return false;
            },

            /**
             * @return {Array} The array of errors resulting of a test execution error
             */
            getExecutionErrors : function () {
                var executionErrors = [];
                var errors = this.getErrors();
                for (var i = 0, l = errors.length; i < l; i++) {
                    var error = errors[i];
                    if (error.type == this.ERROR_TYPES.ERROR) {
                        executionErrors.push(error);
                    }
                }
                return executionErrors;
            },

            /**
             * @return {Array} The array of errors resulting of a test failure
             */
            getFailures : function () {
                var failures = [];
                var errors = this.getErrors();
                for (var i = 0, l = errors.length; i < l; i++) {
                    var error = errors[i];
                    if (error.type == this.ERROR_TYPES.FAILURE) {
                        failures.push(error);
                    }
                }
                return failures;
            },

            /**
             * Raise an error in the Test Context
             * @param {Error} err the Error object caught through the catch statement
             * @param {String} optMsg optional message to add to the error description
             */
            raiseError : function (err, optMsg) {
                var msg = (err.description) ? err.description : err.message;
                msg = '[' + msg + ']';
                if (optMsg) {
                    msg += " " + optMsg;
                }

                this._errors.push({
                    type : this.ERROR_TYPES.ERROR,
                    testMethod : this._currentTestName,
                    description : msg
                });

                // note: no exception need to be thrown as we are already in an exception call
                this.$raiseEvent({
                    name : "error",
                    testClass : this.$classpath,
                    testState : this._currentTestName,
                    exception : err,
                    msg : msg
                });
            },

            /**
             * Raise a failure event, mostly triggered after an assert failed
             * @param {String} msg optional message describing the failed assert
             */
            raiseFailure : function (msg) {
                this._errors.push({
                    type : this.ERROR_TYPES.FAILURE,
                    testMethod : this._currentTestName,
                    description : msg
                });

                this.$raiseEvent({
                    name : "failure",
                    testClass : this.$classpath,
                    testState : this._currentTestName,
                    description : msg
                });
            },

            /**
             * Listen to all events fired by an object. All events will be stored to be checked later on.
             * @param {Object} jsObject : aria templates object (has to extend aria.core.JsObject)
             */
            registerObject : function (jsObject) {
                jsObject.$on({
                    '*' : this._logEvent,
                    scope : this
                });
            },

            /**
             * Use only if you explicitely need to stop listening to events from an object If the object can be
             * disposed, the $dispose will take care of removing the listeners, so use unregisterObject only when really
             * needed
             * @param {Object} jsObject : aria templates object (has to extend aria.core.JsObject)
             */
            unregisterObject : function (jsObject) {
                jsObject.$removeListeners({
                    '*' : this._logEvent,
                    scope : this
                });
            },

            /**
             * Helper function, called when an event happens for which this class is registered
             * @param {Object} evt The Event Object
             */
            _logEvent : function (evt) {
                this.evtLogs.push(evt);
            },

            /**
             * Asserts that an event with a certain name was triggered by the module controller
             * @param {String} evtName The name of the event
             */
            assertEventFired : function (evtName, msg) {
                msg = msg || "Event " + evtName + " not fired";
                this.assertTrue(this.__hasEvent(evtName), msg);
            },

            /**
             * Negative version of assertEventFired
             * @param {String} evtName The name of the event
             */
            assertEventNotFired : function (evtName, msg) {
                msg = msg || "Event " + evtName + " fired";
                this.assertFalse(this.__hasEvent(evtName), msg);
            },

            /**
             * Retrieve the event object corresponding to a given event name
             * @param {String} evtName The name of the event
             * @return {Object} event object corresponding to evtName
             */
            getEvent : function (evtName) {
                for (var i = 0; i < this.evtLogs.length; i++) {
                    if (this.evtLogs[i].name == evtName) {
                        return this.evtLogs[i];
                    }
                }
                return null;
            },

            /**
             * Returns true if the event logs contain a certain event
             * @param {String} evtName The name of the event
             * @return {Boolean} true if an event corresponding to evtName is found in the logs, false otherwise
             */
            __hasEvent : function (evtName) {
                return this.getEvent(evtName) !== null
            },

            /**
             * Clears both connection and event logs.
             */
            clearLogs : function () {
                while (this.evtLogs.length > 0) {
                    this.evtLogs.pop();
                }
            },

            /**
             * Register a list of events that will be checked.
             * @param {Array} List of events to be checked
             */
            registerExpectedEventsList : function (evtList) {
                if (typeof(evtList) != 'object') {
                    // TODO: put an error in the log
                    throw 'registerExpectedEventsList error';
                }
                this._expectedEventsList = evtList;
                this._eventIndexInList = 0;
                if (this._expectedEventsList.length === 0) {
                    this._expectedEventsList = null;
                }
            },

            /**
             * Recursively compares the evt object with the expected event in the list registered with
             * registerExpectedEventsList. Any property that is in the expected object and not in the evt object (with a
             * deep comparison) is reported as an error (but there can be more properties in the evt object). The event
             * object is reported with its name property.
             * @param {Event} Object to be checked.
             */
            checkExpectedEvent : function (evt) {
                if (!this._expectedEventsList) {
                    this.$raiseEvent({
                        name : "failure",
                        testClass : this.$classpath,
                        testState : this._currentTestName,
                        description : 'Unexpected event: ' + evt.name
                    });
                } else {
                    var expectedevt = this._expectedEventsList[this._eventIndexInList];
                    var diff = diffObjects(evt, expectedevt);
                    if (diff) {
                        this.$raiseEvent({
                            name : "failure",
                            testClass : this.$classpath,
                            testState : this._currentTestName,
                            description : 'Event does not respect what was expected (expected: ' + expectedevt.name
                                    + ', occured: ' + evt.name + ', unmatching property: ' + diff.join('.') + ')'
                        });
                    }
                    this._eventIndexInList++;
                    if (this._eventIndexInList >= this._expectedEventsList.length) {
                        this._expectedEventsList = null;
                    }
                }
            },

            /**
             * Check that all events in the list registered with registerExpectedEventsList have occured.
             */
            checkExpectedEventListEnd : function () {
                if (this._expectedEventsList != null) {
                    this.$raiseEvent({
                        name : "failure",
                        testClass : this.$classpath,
                        testState : this._currentTestName,
                        description : 'Not all expected events have occured. First missing event (#'
                                + this._eventIndexInList + '): '
                                + this._expectedEventsList[this._eventIndexInList].name
                    });
                    this._expectedEventsList = null;
                }
            },

            /**
             * Overrides a class with another.
             * @param {String} Classpath of the class to be overriden (e.g. 'aria.core.DownloadMgr')
             * @param {Object} Overriding class (e.g. test.aria.core.DownloadMgrMock) If the class was already
             * overriden, the current class with namespace initialClass is not saved. It is not specific to classes
             * which use the Aria.classDefinition mechanism (does not use $class and $package)
             */
            overrideClass : function (initialClass, mockClass) {
                if (this._overriddenClasses == null) {
                    this._overriddenClasses = {};
                }
                var clsInfos = this._overriddenClasses[initialClass];
                if (clsInfos == null) { // only save the previous class if it was not already overridden
                    var currentClass = Aria.nspace(initialClass);
                    if (currentClass == null)
                        return; // invalid namespace
                    var idx = initialClass.lastIndexOf('.');
                    if (idx > -1) {
                        clsInfos = {
                            clsNs : initialClass.slice(0, idx),
                            clsName : initialClass.slice(idx + 1),
                            initialClass : currentClass
                        };
                    } else {
                        clsInfos = {
                            clsNs : '',
                            clsName : initialClass,
                            initialClass : currentClass
                        };
                    }
                    this._overriddenClasses[initialClass] = clsInfos;
                }
                var ns = Aria.nspace(clsInfos.clsNs);
                ns[clsInfos.clsName] = mockClass;
            },

            /**
             * Reset overriden classes.
             */
            resetClassOverrides : function () {
                if (this._overriddenClasses != null) {
                    for (var i in this._overriddenClasses) {
                        var clsInfos = this._overriddenClasses[i];
                        var ns = Aria.nspace(clsInfos.clsNs);
                        ns[clsInfos.clsName] = clsInfos.initialClass;
                    }
                    this._overriddenClasses = null;
                }
            },

            /**
             * Check that every parameter of the given event has been documented in the corresponding $events structure.
             * To check all events on an object o, you can simply add the following line in your test case: o.$on({'*':
             * this.checkEvent, scope: this})
             * @param {Object} event object
             */
            checkEvent : function (evt) {
                try {
                    this.assertTrue(typeof(evt) == 'object' && typeof(evt.name) == 'string'
                            && typeof(evt.src) == 'object' && typeof(evt.src.$events) == 'object', 'The object passed to checkEvent is not an event.');
                    var evtdesc = evt.src.$events[evt.name];
                    this.assertTrue(evtdesc != null, 'The event "' + evt.name + '" is not defined in '
                            + evt.src.$classpath);
                    for (var i in evt) {
                        if (i != 'src' && i != 'name') {
                            this.assertTrue(evtdesc.properties[i] != null, 'Undocumented event property "' + i
                                    + '" in ' + evt.name + ' from ' + evt.src.$classpath);
                        }
                    }
                } catch (ex) {
                    // TODO What to do if there is an error ?
                }

            }
        }
    });

})();
