/*
 * Copyright Amadeus
 */
/**
 * @class aria.html.beans.TemplateCfg Configuration Beans associated to the HTML include simple widget
 */
Aria.beanDefinitions({
    $package : "aria.html.beans.TemplateCfg",
    $description : "Definition of the JSON beans used by the aria html lib",
    $namespaces : {
        "json" : "aria.core.JsonTypes",
        "html" : "aria.templates.CfgBeans"
    },
    $beans : {
        "Properties" : {
            $type : "json:Object",
            $description : "The configuration for HTML Template include simple widget",
            $properties : {
                "attributes" : {
                    $type : "html:HtmlAttribute",
                    $description : "Parameters to apply to the DOM element of the section."
                },
                "id" : {
                    $type : "json:String",
                    $description : "unique id (within the template) to associate to the widget - if not provided, a unique id will automatically be generated by the framework",
                    $mandatory : false
                },
                "classpath" : {
                    $type : "json:PackageName",
                    $description : "Classpath of the template to be displayed when no customization has been done.",
                    $mandatory : true
                },
                "type" : {
                    $type : "json:String",
                    $description : "DOM type for this section.",
                    $default : "div"
                },
                "data" : {
                    $type : "json:ObjectRef",
                    $description : "JSON object to be made accessible in the sub-template as this.data. By default, use the parent template data, unless moduleCtrl is specified, in which case the data model of that module controller is used.",
                    $mandatory : false
                },
                "moduleCtrl" : {
                    $type : "html:ModuleCtrl",
                    $description : "Module controller to be used with the sub-template. By default, use the parent template module controller, unless data is specified and is the data model of one of the sub-modules of the parent template module controller, in which case that sub-module is used.",
                    $mandatory : false
                },
                "args" : {
                    $type : "json:Array",
                    $description : "Parameters to pass to the main macro in the sub-template.",
                    $contentType : {
                        $type : "json:MultiTypes",
                        $description : "Any parameter to be passed to the main macro in the sub-template."
                    },
                    $default : []
                },
                "baseTabIndex" : {
                    $type : "json:Integer",
                    $description : "The base tab index that will be added to all tab indexes in the template",
                    $default : 0
                }
            }
        }
    }
});