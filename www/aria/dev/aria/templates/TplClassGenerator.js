/*
 * Copyright Amadeus
 */
/**
 * Generate the class definition for an HTML Template
 * @class aria.templates.TplClassGenerator
 */
Aria.classDefinition({
    $classpath : 'aria.templates.TplClassGenerator',
    $extends : 'aria.templates.ClassGenerator',
    $singleton : true,
    $dependencies : ['aria.templates.TplParser', 'aria.widgetLibs.environment.WidgetLibsSettings'],
    $constructor : function () {
        this.$ClassGenerator.constructor.call(this);

        // Load the Template specific statements
        this._loadStatements(["Template", "id", "on", "createView", "section", "@", "bindRefreshTo", "repeater"]);

        // Redefine the protected parser
        this._parser = aria.templates.TplParser;

        // Redefine the class used as the parent for templates which do not inherit from any other template
        this._superClass = "aria.templates.Template";

        this._classType = "TPL";
        this._rootStatement = "Template";
        this._templateParamBean = "aria.templates.CfgBeans.TemplateCfg";

        /**
         * Name of the modifier to be used to escape the output for safety
         * @type String
         */
        this.escapeModifier = "escapeForHTML";
    },
    $prototype : {

        /**
         * Write to the current block of the class writer the $init method which is used both to import the script
         * prototype (if any) and to handle inheritance for macrolibs and for width and height constraints.
         * @param {aria.templates.ClassWriter} out
         * @protected
         */
        _writeClassInit : function (out) {
            var tplParam = out.templateParam;
            out.enterBlock("classInit");
            this._writeMapInheritance(out, "__$macrolibs", out.templateParam.$macrolibs, "{}");
            this._writeValueInheritance(out, "__$width", tplParam.$width, "{}");
            this._writeValueInheritance(out, "__$height", tplParam.$height, "{}");
            out.leaveBlock();
            this.$ClassGenerator._writeClassInit.call(this, out);
        },

        /**
         * Process template content. This method is called from _processRootStatement.
         * @param {Object} Process template content properties (contains out and statement objects).
         * @protected
         */
        _processTemplateContent : function (args) {
            // Note that this method is copied to TmlClassGenerator (cf its $init function)
            var out = args.out;
            var tplParam = out.templateParam;
            var wlibs = tplParam.$wlibs;
            var classes = [];
            var defaultLibs = aria.widgetLibs.environment.WidgetLibsSettings.getWidgetLibs();
            // add all default widget libraries if they are not overridden:
            for (var i in defaultLibs) {
                if (defaultLibs.hasOwnProperty(i)) {
                    if (wlibs[i] == null) {
                        wlibs[i] = defaultLibs[i];
                    }
                }
            }
            for (var i in wlibs) {
                if (wlibs.hasOwnProperty(i)) {
                    if (out.allDependencies) {
                        out.addDependency(wlibs[i]);
                    }
                    classes.push(wlibs[i]);
                }
            }

            Aria.load({
                classes : classes,
                oncomplete : {
                    // call the parent method asynchronously
                    fn : this.$ClassGenerator._processTemplateContent,
                    scope : this,
                    args : args
                }
            });
        }
    }
});
