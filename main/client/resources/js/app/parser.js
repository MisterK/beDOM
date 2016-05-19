var dom2hscript = require('dom2hscript');

var parse = function () {
    var beDOMNodes = [];

    $("script[language='BeDOM']").each(function () {
        var scriptNode = $(this);
        var targetTagId = scriptNode.attr("forTag");

        var targetDOMNode = $("[id='" + targetTagId + "'"); //TODO find a quicker way to get to the node
        if (_.isUndefined(targetDOMNode)) {
            console.error('BeDOM script node without parent');
            return; //TODO use Maybe instead
        }

        var nodeText = $.trim(scriptNode.text()); //TODO validate/sanitize contents
        console.log('Found BeDOM script:\n ' + nodeText);

        beDOMNodes.push({
            targetTagId: targetTagId,
            targetDOMNode: targetDOMNode,
            hscript: dom2hscript.parseDOM(targetDOMNode[0]),
            commands: nodeText,
            triggerContexts: []
        });
    });

    return beDOMNodes;
};

module.exports = {
    parse: parse
};