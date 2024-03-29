/*
 * Copyright Amadeus
 */
/**
 * @class aria.core.JsonTypes
 * Definition of all base types used in JSON schemas
 */
Aria.beanDefinitions({
    $package : "aria.core.JsonTypes",
    $description : "Definition of all base types used in JSON schemas",
    $beans : {
        /* In this file, recursive types are considered as built-in types. */
        /**
         * Simple types
         */
        "String" : {
            $type : "String",
            $description : "Correspond to any possible JavaScript string or characters. Its acceptable values can be restricted by the use of a $regExp property in the schema.",
            $sample : "Some text\non 2 lines!"
        },
        "Boolean" : {
            $type : "Boolean",
            $description : "Correspond to a JavaScript boolean: true or false",
            $sample : true
        },
        "Integer" : {
            $type : "Integer",
            $description : "Correspond to an integer. Its acceptable range can be restricted by the use of the $minValue and $maxValue properties in the schema.",
            $sample : 186
        },
        "Float" : {
            $type : "Float",
            $description : "Correspond to a floating point number. Its acceptable range can be restricted by the use of the $minValue and $maxValue properties in the schema.",
            $sample : 18.6
        },
        "Date" : {
            $type : "Date",
            $description : "Correspond to a date string that can be converted to a JavaScript date",
            $sample : "12/13/2009"
        },
        "RegExp" : {
            $type : "RegExp",
            $description : "Correspond to a JavaScript regular expresssion",
            $sample : /^\w([\w\.]*\w)?$/
        },
        "ObjectRef" : {
            $type : "ObjectRef",
            $description : "Reference to a JavaScript object located outside the JSON structure"
        },
        "FunctionRef" : {
            $type : "FunctionRef",
            $description : "Reference to a JavaScript function."
        },
        "JsonProperty" : {
            $type : "JsonProperty",
            $description : "Any string or integer that can be used as JSON property - must not be a JavaScript reserved word to avoid potential issues with some browsers",
            $sample : "name"
        },
        "Enum" : {
            $type : "Enum",
            $description : "String that can only take a limited number of values - which must be described in the $enumValues Array associated to the element description"
        },
        /**
         * Complex types
         */
        "Object" : {
            $type : "Object",
            $description : "Correspond a structure to with defined parameters : unlike maps, property names are clearly defined. However properties may not be present if not mandatory, and if object is not restricted, other properties might be available. Object description, property name and types must be described in the $properties map of the object schema."
        },
        "Array" : {
            $type : "Array",
            $description : "Correspond to variable-length structure where items are indexed with an integer (first = 0). An array contains items of the same type (which can be a MultiTypes), which is described in the $contentType object of the schema description."
        },
        "Map" : {
            $type : "Map",
            $description : "Like Arrays, Maps correspond to variable-length structure - but contrary to Arrays, Map items are indexed with strings. A map contains items of the same type (which can be a MultiTypes), which is described in the $contentType object of the schema description."
        },
        "MultiTypes" : {
            $type : "MultiTypes",
            $description : "A multi type element is an element that can reference items of different types. As such, its possible types should be described in the $contentTypes array of the schema description."
        },
        /**
         * Commonly used types (not built-in)
         */
        "PackageName" : {
            $type : "String",
            $description : "A string which contains a complete path to a package or a class.",
            $sample : "aria.core.JsonTypes",
            $regExp : /^([a-zA-Z_\$][\w\$]*($|\.(?=.)))+$/
        }
    }
});