/*
 * Copyright Amadeus
 */
/**
 * Abstract class that defines the API to interact with HTML5 DOM storage mechanism like localStorage and
 * sessionStorage. On top of the standard functionalities it also provides an event mechanism across instances, while in
 * the standard API events are not raised in the page that is currently modifying the storage location.
 */
Aria.classDefinition({
    $classpath : "aria.storage.HTML5Storage",
    $dependencies : ["aria.utils.Event"],
    $extends : "aria.storage.AbstractStorage",
    $statics : {
        UNAVAILABLE : "%1 not supported by the browser."
    },
    /**
     * Create a generic instance of HTML5Storage
     * @param {aria.storage.Beans.ConstructorArgs} options Constructor options
     * @param {String} storage Type of storage: either localStorage or sessionStorage
     */
    $constructor : function (options, storage, throwIfMissing) {
        this.$AbstractStorage.constructor.call(this, options);

        /**
         * Type of html5 storage. E.g. localStorage, sessionStorage
         * @type String
         */
        this.type = storage;

        /**
         * Keep a reference to the global storage object
         * @type Object
         */
        this.storage = Aria.$window[storage];

        /**
         * Event Callback for storage event happening on different windows
         * @type aria.core.CfgBeans.Callback
         */
        this._browserEventCb = {
            fn : this._browserEvent,
            scope : this
        };

        if (this.storage) {
            // listen to events raised by instances in a different window but the same storage location
            aria.utils.Event.addListener(Aria.$window, "storage", this._browserEventCb);
        } else if (throwIfMissing !== false) {
            // This might have been created by AbstractStorage
            if (this._disposeSerializer && this.serializer) {
                this.serializer.$dispose();
            }

            this.$logError(this.UNAVAILABLE, [this.type]);
            throw new Error(this.type);
        }
    },
    $destructor : function () {
        aria.utils.Event.removeListener(Aria.$window, "storage", this._browserEventCb);
        this._browserEventCb = null;
        this.__target = null;

        this.$AbstractStorage.$destructor.call(this);
    },
    $prototype : {
        /**
         * Internal method to get the current value associated with the given key. If the given key does not exist in
         * the list associated with the object then this method returns null.
         * @param {String} key identifier of a value
         * @return {String} Value stored as is
         */
        _get : function (key) {
            return this.storage.getItem(key);
        },

        /**
         * Internal method to add a key/value pair in the list.
         * @param {String} key identifier of a value
         * @param {String} value value to be stored after serialization
         */
        _set : function (key, value) {
            this.storage.setItem(key, value);
        },

        /**
         * Internal method to remove the value associated to key from the list.
         * @param {String} key identifier of the value to be removed
         */
        _remove : function (key) {
            this.storage.removeItem(key);
        },

        /**
         * Internal methof to empty the list of all key/value pairs, if any.
         */
        _clear : function () {
            this.storage.clear();
        },

        /**
         * React to storage event raised by the browser. We react only if this class does not have a namespace or if the
         * key appears to be correctly namespaced.
         * @param {HTMLEvent} event Event raised by the browser
         */
        _browserEvent : function (event) {
            // In FF 3.6 this event is raised also inside the same window
            if (aria.storage.EventBus.stop) {
                return;
            }

            var isInteresting = this.namespace
                    ? event.key.substring(0, this.namespace.length) === this.namespace
                    : true;

            if (isInteresting) {
                var oldValue = event.oldValue, newValue = event.newValue;
                if (oldValue) {
                    oldValue = this.serializer.parse(oldValue);
                }
                if (newValue) {
                    newValue = this.serializer.parse(newValue);
                }
                this._onStorageEvent({
                    name : "change",
                    key : event.key,
                    oldValue : oldValue,
                    newValue : newValue,
                    url : event.url,
                    namespace : this.namespace
                });
            }
        },

        /**
         * Override the $on function to log an error in IE8 that doesn't support storage event
         * @param {Object} event Event description
         * @override
         */
        $on : function (event) {
            if (aria.core.Browser.isIE8) {
                this.$logWarn(this.UNAVAILABLE, "change event");
            }

            this.$AbstractStorage.$on.call(this, event);
        }
    }
});