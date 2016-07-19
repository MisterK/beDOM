var dom2hscript = require('dom2hscript');
var h = require('virtual-dom/h');
var BeDOMNode = require('./nodes/beDOMNode');

var parse = function () {
    var beDOMNodes = [];
    console.log('============= Parsing phase ==============');
    $("script[language='BeDOM']").each(function () { //TODO Minor: Use .reduce() instead, then flatten
        var scriptNode = $(this);
        var targetTagId = scriptNode.attr("forTag");

        var nodeText = $.trim(scriptNode.text()); //TODO Later: validate/sanitize contents
        console.log('Found BeDOM script for tag "' + targetTagId + '":\n ' + nodeText);

        //Do not fully re-process a node that has already been processed
        var alreadyProcessedNodeIndex = _.findIndex(beDOMNodes,
            function (beDOMNode) {
                return beDOMNode.targetTagId == targetTagId;
            });
        if (alreadyProcessedNodeIndex >= 0) {
            beDOMNodes.splice(alreadyProcessedNodeIndex, 1,
                beDOMNodes[alreadyProcessedNodeIndex].appendCommands(nodeText));
            return;
        }

        var targetDOMNode = $("[id='" + targetTagId + "']"); //TODO Minor: find a quicker way to get to the node
        if (_.isUndefined(targetDOMNode)) {
            console.error('Error: BeDOM script node without parent');
            return; //TODO Minor: use Maybe instead, if reducing
        }

        var hscript;
        try {
            hscript = eval(dom2hscript.parseDOM(targetDOMNode[0]));
        } catch (e) {
            console.error("Error while evaluating beDOMNode's hscript: " + e);
            return; //TODO Minor: use Maybe instead, if reducing
        }

        beDOMNodes.push(new BeDOMNode(targetTagId, targetDOMNode, hscript, nodeText));
    });

    console.log("Found " + beDOMNodes.length + " beDOMNode(s)");
    console.log("==============================================");
    return beDOMNodes;
};

module.exports = {
    parse: parse
};
