/*
 * Copyright Amadeus
 */
(function () {
    /**
     * This function handles environment change. When the contextual menu is enabled it loads the required classes.
     */
    var changingEnvironment = function (evt) {
        if (!evt || !evt.changedProperties || aria.utils.Array.contains(evt.changedProperties, "contextualMenu")) {
            Aria.load({
                classes : [contextualClasspath]
            });
        }
    };

    /**
     * Checks if the Contextual Menu is enable. This function should be used only before loading the class definition.
     * It would be nice to use aria.tools.contextual.environment.ContextualMenu, but it might not be loaded yet.
     */
    var isEnabled = function () {
        var settings = aria.core.AppEnvironment.applicationSettings.contextualMenu;
        return settings && settings.enabled;
    };

    /**
     * Classpath of the ContextualMenu class
     */
    var contextualClasspath = "aria.tools.contextual.ContextualMenu";

    /**
     * Dependencies of aria.templates.Template. It's here because we might need to push a new dependency before calling
     * the class definition.
     */
    var $dependencies = ["aria.tools.contextual.environment.ContextualMenu", "aria.templates.TemplateCtxt",
            "aria.utils.Array", "aria.utils.Json", "aria.templates.ITemplate", "aria.utils.environment.VisualFocus"];

    if (isEnabled()) {
        $dependencies.push(contextualClasspath);
    }

    /**
     * Base class from which all templates inherit. Some methods will be added to instances of this class, from the
     * TemplateCtxt class.
     */
    Aria.classDefinition({
        $classpath : "aria.templates.Template",
        $extends : "aria.templates.BaseTemplate",
        $dependencies : $dependencies,
        $statics : {
            // ERROR MESSAGES:
            EXCEPTION_IN_CONTROL_PARAMETERS : "line %2: Uncaught runtime exception in control %3 for parameters '%1'",
            EXCEPTION_IN_REPEATER_PARAMETER : "line %2: Uncaught runtime exception in repeater parameter '%1'"
        },
        $onload : function () {
            var contextualEnvironment = aria.tools.contextual.environment.ContextualMenu;
            if (!contextualEnvironment.getContextualMenu().enabled) {
                // since it's disabled, add a listener to load a class when it's enabled
                aria.core.AppEnvironment.$on({
                    "environmentChanged" : changingEnvironment,
                    scope : {}
                });
            }
        },
        $prototype : {
            // $width and $height are the current values for width and height
            $width : undefined,
            $height : undefined,

            /**
             * Prototype init method called at prototype creation time Allows to store class-level objects that are
             * shared by all instances
             * @param {Object} p the prototype object being built
             * @param {Object} def the class definition
             */
            $init : function (p, def) {
                // The prototype should be an instance of Template, that inheriths from BaseTemplate
                p.$BaseTemplate.constructor.classDefinition.$prototype.$init(p, def);

                // copy the prototype of ITemplate:
                var itf = aria.templates.ITemplate.prototype;
                for (var key in itf) {
                    if (itf.hasOwnProperty(key) && !p.hasOwnProperty(key)) {
                        // copy methods which are not already on this object (this avoids copying $classpath and
                        // $destructor)
                        p[key] = itf[key];
                    }
                }

                // get shortcuts to necessary functions in other classes,
                // so that templates work even in a sandbox
                p.$json = aria.utils.Json;
            },

            /**
             * Function to be overriden by subclasses to receive events from the module controller.
             * @param {Object} evt the event object (depends on the module event)
             */
            onModuleEvent : function (evt) {
                // default implementation: just ignore the events
            },

            /**
             * Function to be overriden by subclasses to receive events from the flow controller.
             * @param {Object} evt the event object (depends on the flow event)
             */
            onFlowEvent : function (evt) {
                // default implementation: just ignore the events
            },

            /**
             * This function can be overridden by Template Scripts. It is called by the TemplateLoader when data is
             * ready for use by the template.
             */
            $dataReady : function () {
                // default implementation
            },

            /**
             * This function can be overridden by Template Scripts. It is called by the TemplateLoader when the template
             * has been succesfully rendered.
             */
            $viewReady : function () {
                // default implementation
            },

            /**
             * This function can be overridden by Template Scripts. It is called after any refresh when all elements
             * from the view are displayed, including subtemplates.
             */
            $displayReady : function () {
                // default implementation
            }
        }
    });
})();