/*
 * Copyright Amadeus
 */
/**
 * Base class containing shared methods for all environment classes.
 * @class aria.core.environment.EnvironmentBase
 */
Aria.classDefinition({
    $classpath : "aria.core.environment.EnvironmentBase",
    $dependencies : ["aria.utils.Object"],
    $constructor : function () {
        this.$assert(9, this._cfgPackage != null);
        /**
         * Contains the default configuration for the part of the environment managed by this class. This is used to
         * know which are the environment properties managed by this class.
         * @type Object
         */
        this._localDefCfg = {};
        var validCfg = aria.core.JsonValidator.normalize({
            json : this._localDefCfg,
            beanName : this._cfgPackage
        });
        this.$assert(15, validCfg);

        this._changingEnvironment({
            changedProperties : null,
            asyncCalls : 0,
            callback : null
        });
        aria.core.AppEnvironment.$on({
            "changingEnvironment" : this._changingEnvironment,
            scope : this
        });
    },
    $destructor : function () {
        aria.core.AppEnvironment.$unregisterListeners(this);
        this._localDefCfg = null;
    },
    $statics : {
        // ERROR MESSAGES:
        INVALID_LOCALE : "Error: the locale '%1' is not in correct format"
    },
    $events : {
        "environmentChanged" : {
            description : "Notifies that the application environment has changed."
        }
    },
    $prototype : {
        /**
         * Classpath of the bean which allows to validate the part of the environment managed by this class. It is meant
         * to be overriden by sub-classes.
         * @type String
         */
        _cfgPackage : null,

        /**
         * Listener for the changingEnvironment event from the aria.core.AppEnvironment. It checks if the changes in the
         * environment are managed by this class and calls _normAndApplyEnv if it is the case.
         * @param {Object} evt event object
         */
        _changingEnvironment : function (evt) {
            var changedProperties = evt.changedProperties;
            var localCfg = this._localDefCfg;
            var doUpdate = (changedProperties == null); // always do an update on reset
            if (changedProperties) {
                // look if the changed keys are part of this local environment
                for (var i = 0, l = changedProperties.length; i < l; i++) {
                    var propName = changedProperties[i];
                    if (propName in localCfg) {
                        doUpdate = true;
                        break;
                    }
                }
            }
            if (doUpdate) {
                evt.asyncCalls++;
                this._normAndApplyEnv(evt.callback);
            }
        },

        /**
         * Normalize the part of the environment managed by this class, then calls _applyEnvironment to apply it if the
         * environment is valid. Normalization is immediate. Applying the environment can be asynchronous. The callback
         * is called either synchronously or asynchronously.
         * @param {aria.core.JsObject.Callback} callback Will be called when the environment is applied.
         */
        _normAndApplyEnv : function (callback) {
            var validConfig = aria.core.JsonValidator.normalize({
                json : aria.core.AppEnvironment.applicationSettings,
                beanName : this._cfgPackage
            });
            if (validConfig) {
                this._applyEnvironment(callback);
                this.$raiseEvent("environmentChanged");
            } else {
                this.$callback(callback);
            }
        },

        /**
         * Apply the current environment.
         * @param {aria.core.JsObject.Callback} callback Will be called after the environment is applied.
         * @protected
         */
        _applyEnvironment : function (callback) {
            this.$callback(callback);
        },

        /**
         * Compares user defined settings, if a setting doesn't exist then the default bean definition is used.
         * @pubic
         * @param {String} name
         * @return {Object} can be a string or an object containing user defined settings or the default bean
         * definitions.
         */
        checkApplicationSettings : function (name) {
            return aria.core.AppEnvironment.applicationSettings[name];
        },

        /**
         * This method is deprecated. Please use aria.core.AppEnvironment.setEnvironment instead.<br />
         * Stores the application variables. Please refer to documentation for parameter types.
         * @public
         * @param {Object} cfg Configuration object
         * @param {aria.core.JsObject.Callback} cb Method to be called after the setting is done
         * @param {Boolean} update flag to update existing application settings, when false will overwrite existing with
         * new settings.
         * @deprecated
         */
        setEnvironment : function (cfg, callback, merge) {
            this.$logWarn("The setEnvironment method on this object is deprecated. Please use aria.core.AppEnvironment.setEnvironment instead.");
            aria.core.AppEnvironment.setEnvironment(cfg, callback, merge);
        }

    }
});