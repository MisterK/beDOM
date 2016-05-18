var dom2hscript = require('dom2hscript');

var parse = function () {
    var beDOMNodes = [];

    $("script[language='BeDOM']").each(function () {
        var scriptNode = $(this);

        var beDOMNode = $("[id='" + scriptNode.attr("forTag") + "'"); //TODO find a quicker way to get to the node
        if (_.isUndefined(beDOMNode)) {
            console.error('BeDOM script node without parent');
            return; //TODO use Maybe instead
        }

        var nodeText = $.trim(scriptNode.text()); //TODO validate/sanitize contents
        console.log('Found BeDOM script:\n ' + nodeText);

        beDOMNodes.push({
            hscript: dom2hscript.parseDOM(beDOMNode[0]),
            commands: nodeText
        });
    });

    return beDOMNodes;
};

module.exports = {
    parse: parse
};