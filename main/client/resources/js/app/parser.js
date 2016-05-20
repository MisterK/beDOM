var dom2hscript = require('dom2hscript');
var h = require('virtual-dom/h');

var parse = function () {
    var beDOMNodes = [];

    $("script[language='BeDOM']").each(function () {
        var scriptNode = $(this);
        var targetTagId = scriptNode.attr("forTag");

        var nodeText = $.trim(scriptNode.text()); //TODO validate/sanitize contents
        console.log('Found BeDOM script:\n ' + nodeText);

        //Do not fully re-process a node that has already been processed
        var alreadyProcessedNode = _.find(beDOMNodes,
            function(beDOMNode) { return beDOMNode.targetTagId == targetTagId; });
        if (!_.isUndefined(alreadyProcessedNode)) {
            alreadyProcessedNode.commands += " \n" + nodeText;
            return;
        }

        var targetDOMNode = $("[id='" + targetTagId + "'"); //TODO find a quicker way to get to the node
        if (_.isUndefined(targetDOMNode)) {
            console.error('Error: BeDOM script node without parent');
            return; //TODO use Maybe instead
        }

        var hscript;
        try {
            hscript = eval(dom2hscript.parseDOM(targetDOMNode[0]));
        } catch (e) {
            console.error("Error while evaluating beDOMNode's hscript: " + e);
            return; //TODO use Maybe instead
        }

        beDOMNodes.push({
            targetTagId: targetTagId,
            targetDOMNode: targetDOMNode,
            hscript: hscript,
            commands: nodeText,
            triggerContexts: [],
            cloneWithNewHScript: function(newHScript) {
                return {
                    targetTagId: this.targetTagId,
                    targetDOMNode: this.targetDOMNode,
                    hscript: newHScript,
                    commands: this.commands,
                    triggerContexts: this.triggerContexts,
                    cloneWithNewHScript: this.cloneWithNewHScript
                };
            }
        });
    });

    return beDOMNodes;
};

module.exports = {
    parse: parse
};