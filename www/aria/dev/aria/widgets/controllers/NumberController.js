/*
 * Copyright Amadeus
 */
/**
 * Data controller associated to NumberField. It checks the input value, updates the data model and generates a report
 */
Aria.classDefinition({
    $classpath : "aria.widgets.controllers.NumberController",
    $extends : "aria.widgets.controllers.TextDataController",
    $dependencies : ["aria.DomEvent", "aria.widgets.controllers.reports.ControllerReport", "aria.utils.Number"],
    $resources : {
        "res" : "aria.widgets.WidgetsRes"
    },
    $constructor : function () {
        this.$TextDataController.constructor.call(this);

        /**
         * Data model associated to number input
         * @type Object
         */
        this._dataModel = {
            number : 0,
            displayText : ''
        };

        /**
         * NumberField pattern
         * @type String
         */
        this._pattern = '';
    },
    $destructor : function () {
        this._dataModel = null;
        this.$TextDataController.$destructor.call(this);
        this._pattern = null;
    },
    $prototype : {

        /**
         * Set Pattern if one has been specified
         * @param {String} internalValue
         */
        setPattern : function (pattern) {
            if (pattern) {
                if (aria.utils.Number.isValidPattern(pattern)) {
                    this._pattern = pattern;
                } else {
                    this.$logError(aria.widgets.Widget.INVALID_CONFIGURATION, ["pattern "]);
                }
            }
        },

        /**
         * Override TextDataController.checkValue
         * @param {Number} internalValue - Internal value of to be validated
         * @return {aria.widgets.controllers.reports.ControllerReport}
         */
        checkValue : function (internalValue) {
            var report = new aria.widgets.controllers.reports.ControllerReport();

            report.ok = (internalValue === null || aria.utils.Type.isNumber(internalValue));
            if (report.ok) {
                this._dataModel.number = internalValue;

                if (internalValue !== null) {
                    if (this._pattern) {
                        this._dataModel.displayText = aria.utils.Number.formatNumber(internalValue.toString(), this._pattern);
                    } else {
                        this._dataModel.displayText = internalValue.toString();
                    }
                } else {
                    this._dataModel.displayText = '';
                }

                report.text = this._dataModel.displayText;
                report.value = this._dataModel.number;
            }
            return report;
        },

        /**
         * Override TextDataController.checkText
         * @param {String} text - the displayed text
         * @param {Boolean} hasErrors - flags if errors have been already found
         * @return {aria.widgets.controllers.reports.ControllerReport}
         */
        checkText : function (text, hasErrors) {
            // return object
            var report = new aria.widgets.controllers.reports.ControllerReport();
            report.ok = false;
            // an empty field is not usually considered as an error
            if (!text) {
                report.ok = true;
                this._dataModel.displayText = '';
                this._dataModel.number = null;
            } else {
                if (text === this._dataModel.displayText) {
                    // Nothing changed
                    report.ok = !hasErrors;
                    if (!report.ok) {
                        report.errorMessages[0] = this.res.errors["40006_WIDGET_NUMBERFIELD_VALIDATION"];
                    }
                } else {
                    // Update the text datamodel
                    this._dataModel.displayText = text;

                    var number = aria.utils.Number.interpretNumber(text, this._pattern);
                    number = aria.utils.Number.toNumber(number);

                    // If the number is valid, update the datamodel
                    if (number !== null) {
                        this._dataModel.number = number;
                        this._dataModel.displayText = aria.utils.Number.formatNumber(number, this._pattern);

                        report.ok = true;
                    } else {
                        report.errorMessages[0] = this.res.errors["40006_WIDGET_NUMBERFIELD_VALIDATION"];
                        // The text doesn't correspond to a valid number
                        this._dataModel.number = null;
                    }
                }
            }

            // update report with current datamodel values
            report.text = this._dataModel.displayText;
            report.value = this._dataModel.number;

            return report;
        }
    }
});