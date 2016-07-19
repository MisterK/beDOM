var thisTagFn = require('./thisTag.js');

var execute = function(executionContext, beDOMNodes) {
    console.log('============= Binding phase ==============');
    _.each(beDOMNodes, function(beDOMNode) { //TODO reduce beDOMNodes[] on thisTag => then return beDOMNodes[]
        var thisTag = thisTagFn(executionContext, beDOMNodes, beDOMNode);
        try {
            eval(beDOMNode.commands);
        } catch (e) {
            console.error('Error evaluating BeDOM script:' + e);
        }
    });
    console.log("==============================================");
};

module.exports = {
    execute: execute
};