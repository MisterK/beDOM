var ThisTag = require('./thisTag.js');

var execute = function(executionContext) {
    console.log('============= Binding phase ==============');
    _.reduce(executionContext.beDOMNodes, function(thisTagFn, beDOMNode) {
        var thisTag = thisTagFn.forBeDOMNode(beDOMNode);
        try {
            eval(beDOMNode.commands);
        } catch (e) {
            console.error('Error evaluating BeDOM script:' + e);
        }
        return thisTag;
    }, new ThisTag(executionContext));
    console.log("==============================================");
};

module.exports = {
    execute: execute
};