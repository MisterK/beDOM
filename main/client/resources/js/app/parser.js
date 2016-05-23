var dom2hscript = require('dom2hscript');
var h = require('virtual-dom/h');
var VNode = require('virtual-dom/vnode/vnode');

var parse = function () {
    var beDOMNodes = [];
    console.log('============= Parsing phase ==============');
    $("script[language='BeDOM']").each(function () { //TODO Minor: Use .map() instead
        var scriptNode = $(this);
        var targetTagId = scriptNode.attr("forTag");

        var nodeText = $.trim(scriptNode.text()); //TODO Later: validate/sanitize contents
        console.log('Found BeDOM script:\n ' + nodeText);

        //Do not fully re-process a node that has already been processed
        var alreadyProcessedNode = _.find(beDOMNodes,
            function(beDOMNode) { return beDOMNode.targetTagId == targetTagId; });
        if (!_.isUndefined(alreadyProcessedNode)) {
            alreadyProcessedNode.commands += " \n" + nodeText;
            return;
        }

        var targetDOMNode = $("[id='" + targetTagId + "']"); //TODO Minor: find a quicker way to get to the node
        if (_.isUndefined(targetDOMNode)) {
            console.error('Error: BeDOM script node without parent');
            return; //TODO Minor: use Maybe instead
        }

        var hscript;
        try {
            hscript = eval(dom2hscript.parseDOM(targetDOMNode[0]));
        } catch (e) {
            console.error("Error while evaluating beDOMNode's hscript: " + e);
            return; //TODO Minor: use Maybe instead
        }

        beDOMNodes.push({ //TODO Move to constructor function
            targetTagId: targetTagId,
            targetDOMNode: targetDOMNode,
            hscript: hscript,
            commands: nodeText,
            triggerContexts: [],
            dataChanges: [],
            cloneWithNewHScript: function(newHScript) {
                return {
                    targetTagId: this.targetTagId,
                    targetDOMNode: this.targetDOMNode,
                    hscript: newHScript,
                    commands: this.commands,
                    triggerContexts: this.triggerContexts,
                    dataChanges: this.dataChanges,
                    cloneWithNewHScript: this.cloneWithNewHScript,
                    cloneWithNewDataChange: this.cloneWithNewDataChange,
                    cloneHScript: this.cloneHScript
                };
            },
            cloneWithNewDataChange: function(dataChange) {
                var newDataChanges = _.clone(this.dataChanges);
                newDataChanges.push(dataChange);
                return {
                    targetTagId: this.targetTagId,
                    targetDOMNode: this.targetDOMNode,
                    hscript: this.cloneHScript(),
                    commands: this.commands,
                    triggerContexts: this.triggerContexts,
                    dataChanges: newDataChanges,
                    cloneWithNewHScript: this.cloneWithNewHScript,
                    cloneWithNewDataChange: this.cloneWithNewDataChange,
                    cloneHScript: this.cloneHScript
                };
            },
            cloneHScript: function() {
                var newHScript = _.cloneDeep(this.hscript);
                newHScript.__proto__ = VNode.prototype;
                return newHScript;
            }
        });
    });

    console.log("Found " + beDOMNodes.length + " beDOMNode(s)");
    console.log("==============================================");
    return beDOMNodes;
};

module.exports = {
    parse: parse
};
