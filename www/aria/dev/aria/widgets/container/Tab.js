/*
 * Copyright Amadeus
 */
/**
 * Tab widget
 */
Aria.classDefinition({
    $classpath : "aria.widgets.container.Tab",
    $extends : "aria.widgets.container.Container",
    $dependencies : ["aria.widgets.frames.FrameFactory", "aria.utils.Function"],
    $css : ["aria.widgets.container.TabStyle"],
    /**
     * Tab constructor
     * @param {aria.widgets.CfgBeans.TabCfg} cfg the widget configuration
     * @param {aria.templates.TemplateCtxt} ctxt template context
     */
    $constructor : function (cfg, ctxt) {
        this.$Container.constructor.apply(this, arguments);
        this._setSkinObj("Tab");

        /**
         * Whether the mouse is over the Tab or not
         * @type Boolean
         * @protected
         */
        this._mouseOver = false;

        /**
         * Whether the Tab is focused or not
         * @type Boolean
         * @protected
         */
        this._hasFocus = false;

        this._updateState(true);

        /**
         * Frame instance. Actual instance depends on the skin
         * @type aria.widgets.frames.Frame
         * @protected
         */
        this._frame = aria.widgets.frames.FrameFactory.createFrame({
            height : cfg.height,
            state : this._state,
            width : cfg.width,
            sclass : cfg.sclass,
            skinnableClass : "Tab",
            printOptions : cfg.printOptions,
            id : Aria.testMode ? this._domId + "_" + cfg.tabId : undefined
        });

        /**
         * Override default widget's span style
         * @type String
         * @protected
         * @override
         */
        this._spanStyle = "z-index:100;vertical-align:top;";
    },
    $destructor : function () {

        if (this._frame) {
            this._frame.$dispose();
            this._frame = null;
        }

        this.$Container.$destructor.call(this);
    },
    $prototype : {
        /**
         * Prototype init method called at prototype creation time Allows to store class-level objects that are shared
         * by all instances
         * @param {Object} p the prototype object being built
         * @param {Object} def the class definition
         * @param {Object} sdef the superclass class definition
         */
        $init : function (p, def, sdef) {
            // prototype initialization function
            // we add the bindable properties to the Widget prototype
            p.bindableProperties = p.bindableProperties.concat(["selectedTab"]);
        },

        /**
         * Called when a new instance is initialized
         * @protected
         */
        _init : function () {
            var domElt = this.getDom();
            var actingDom = aria.utils.Dom.getDomElementChild(domElt, 0);

            if (actingDom) {
                this._frame.linkToDom(actingDom);
            }

            aria.widgets.container.Tab.superclass._init.call(this);
        },

        /**
         * Give focus to the element representing the focus for this widget
         */
        _focus : function () {
            try {
                this.getDom().focus();
            } catch (ex) {
                // FIXME: fix for IE7, investigate why it may fail, actually, why should this work???
            }
        },

        /**
         * Internal method called when one of the model properties that the widget is bound to has changed Must be
         * overridden by sub-classes defining bindable properties
         * @param {String} propertyName the property name
         * @param {Object} newValue the new value
         * @param {Object} oldValue the old property value
         * @protected
         */
        _onBoundPropertyChange : function (propertyName, newValue, oldValue) {
            var changedState = false;
            if (propertyName === "selectedTab") {
                if (newValue === this._cfg.tabId || oldValue === this._cfg.tabId) {
                    changedState = true;
                }
            } else {
                this.$Container._onBoundPropertyChange.call(this, propertyName, newValue, oldValue);
            }

            if (changedState) {
                this._cfg[propertyName] = newValue;
                this._updateState();
            }
        },

        /**
         * Internal function to generate the internal widget markup
         * @param {aria.templates.MarkupWriter} out
         * @protected
         */
        _widgetMarkupBegin : function (out) {
            this._frame.writeMarkupBegin(out);
        },

        /**
         * Internal function to generate the internal widget markup
         * @param {aria.templates.MarkupWriter} out
         * @protected
         */
        _widgetMarkupEnd : function (out) {
            this._frame.writeMarkupEnd(out);
        },

        /**
         * A private method to set this objects skin object
         * @param {String} widgetName
         * @protected
         */
        _setSkinObj : function (widgetName) {
            this._skinObj = aria.widgets.AriaSkinInterface.getSkinObject(widgetName, this._cfg.sclass);
        },

        /**
         * Internal method to update the state of the tab, from the config and the mouse over variable
         * @param {Boolean} skipChangeState - If true we don't update the state in the frame as the frame may not be
         * initialised
         * @protected
         */
        _updateState : function (skipChangeState) {
            var state = "normal";
            var cfg = this._cfg;

            if (cfg.disabled) {
                state = "disabled";
            } else if (cfg.tabId === cfg.selectedTab) {
                state = "selected";
            } else {
                if (this._mouseOver) {
                    state = "msover";
                }
            }

            if (this._hasFocus) {
                state += "Focused";
            }
            this._state = state;

            if (!skipChangeState) {
                // force widget - DOM mapping
                this.getDom();
                this._frame.changeState(this._state);
            }
        },

        /**
         * Set the current tab as selected
         * @protected
         */
        _selectTab : function () {
            this.changeProperty("selectedTab", this._cfg.tabId);
        },

        /**
         * The method called when the markup is clicked
         * @param {aria.DomEvent} domEvt
         * @protected
         */
        _dom_onclick : function (domEvt) {
            this._selectTab();
            if (!this._hasFocus) {
                this._focus();
            }
        },

        /**
         * Internal method to handle the mouse over event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onmouseover : function (domEvt) {
            this.$Container._dom_onmouseover.call(this, domEvt);
            this._mouseOver = true;
            this._updateState();

        },

        /**
         * Internal method to handle the mouse out event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onmouseout : function (domEvt) {
            this.$Container._dom_onmouseout.call(this, domEvt);
            this._mouseOver = false;
            this._updateState();

        },

        /**
         * Internal method to handle focus event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onfocus : function (domEvt) {
            var cfg = this._cfg;
            this._hasFocus = true;
            this._updateState();
        },

        /**
         * Internal method to handle blur event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onblur : function (domEvt) {
            var cfg = this._cfg;
            this._hasFocus = false;
            this._updateState();
        },

        /**
         * Internal method to handle keyboard event
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onkeyup : function (domEvt) {
            return false;
        },

        /**
         * @protected
         * @param {aria.DomEvent} domEvt
         */
        _dom_onkeydown : function (domEvt) {
            if (domEvt.keyCode == aria.DomEvent.KC_SPACE || domEvt.keyCode == aria.DomEvent.KC_ENTER) {
                this._selectTab();
            }
        }

    }
});
