var ThisTag = require('./thisTag.js');

var bindListenerContexts = function(executionContext) {
    console.log('============= Binding listener contexts phase ==============');
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
    return executionContext;
};

module.exports = {
    bindListenerContexts: bindListenerContexts
};