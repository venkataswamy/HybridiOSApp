/*
 * Copyright Amadeus
 */
Aria.tplScriptDefinition({$classpath:"aria.tools.inspector.InspectorDisplayScript",$prototype:{tplMouseOver:function(a,b){this.moduleCtrl.displayHighlight(b.templateCtxt.getContainerDiv());this.data.overModuleCtrl=b.moduleCtrl;this.mouseOver(a);this._refreshModulesDisplay();a.stopPropagation()},tplMouseOut:function(a){this.data.overModuleCtrl=null;this.mouseOut(a);this._refreshModulesDisplay();a.stopPropagation()},moduleMouseOver:function(a,b){this.data.overTemplates=b.outerTemplateCtxts;this.mouseOver(a);
this._refreshTemplatesDisplay();a.stopPropagation()},moduleMouseOut:function(a){this.data.overTemplates=null;this.mouseOut(a);this._refreshTemplatesDisplay();a.stopPropagation()},mouseOver:function(a){a.target.setStyle("background:#DDDDDD;")},mouseOut:function(a){a.target.setStyle("")},selectTemplate:function(a,b){this.data.selectedTemplate=b;this.$refresh()},selectModule:function(a,b){this.data.selectedModule=b;this.$refresh()},reloadTemplate:function(a,b){this.moduleCtrl.reloadTemplate(b.templateCtxt)},
refreshTemplate:function(a,b){this.moduleCtrl.refreshTemplate(b.templateCtxt)},onModuleEvent:function(a){a.name=="contentChanged"&&this.$refresh()},_refreshModulesDisplay:function(){this.$refresh({filterSection:"modules",macro:{name:"displayModules",args:[this.data.modules]}})},_refreshTemplatesDisplay:function(){this.$refresh({filterSection:"templates",macro:{name:"displayTemplates",args:[this.data.templates]}})}}});