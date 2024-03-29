/*
 * Copyright Amadeus
 */
/**
 * @class aria.embed.CfgBeans Configuration Beans associated to the Aria Templates Widgets
 */
Aria.beanDefinitions({
    $package : "aria.embed.CfgBeans",
    $description : "Definition of the JSON beans used by the aria embed lib",
    $namespaces : {
        "json" : "aria.core.JsonTypes",
        "html" : "aria.templates.CfgBeans"
    },
    $beans : {
        "ElementCfg" : {
            $type : "json:Object",
            $description : "Embed element widget",
            $properties : {
                "controller" : {
                    $type : "json:ObjectRef",
                    $description : "Controller used to manage the embedded dom"
                },
                "type" : {
                    $type : "json:String",
                    $description : "DOM type for this section.",
                    $default : "div"
                },
                "attributes" : {
                    $type : "html:HtmlAttribute",
                    $description : "Parameters to apply to the DOM element of the section."
                },
                "args" : {
                    $type : "json:MultiTypes",
                    $description : "Argument given to the onEmbededElementCreate and onEmbededElementDispose functions of the provided embed controller"
                }
            }
        },
        "PlaceholderCfg" : {
            $type : "json:Object",
            $description : "Placeholder",
            $properties : {
                "name" : {
                    $type : "json:String",
                    $description : "Placeholder name",
                    $mandatory : true
                },
                "type" : {
                    $type : "json:String",
                    $description : "DOM type for this section.",
                    $default : "div"
                },
                "attributes" : {
                    $type : "html:HtmlAttribute",
                    $description : "Parameters to apply to the DOM element of the section."
                }
            }
        },
        "MapCfg" : {
            $type : "json:Object",
            $description : "Map widget configuration",
            $properties : {
                "id" : {
                    $type : "json:String",
                    $description : "Id of the map",
                    $mandatory : true
                },
                "provider" : {
                    $type : "json:String",
                    $description : "Map provider",
                    $mandatory : true
                },
                "initArgs" : {
                    $type : "json:MultiTypes",
                    $description : "Map initialization arguments"
                },
                "loadingIndicator" : {
                    $type : "json:Boolean",
                    $description : "Add a loading overlay over the map while loading",
                    $default : false
                },
                "type" : {
                    $type : "json:String",
                    $description : "DOM type for this section.",
                    $default : "div"
                },
                "attributes" : {
                    $type : "html:HtmlAttribute",
                    $description : "Parameters to apply to the DOM element of the section."
                }
            }
        }
    }
});