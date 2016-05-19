var thisTagFn = require('./thisTag.js');

var execute = function(executionContext, beDOMNodes) {
    _.each(beDOMNodes, function(beDOMNode) {
        var thisTag = thisTagFn(executionContext, beDOMNodes, beDOMNode);
        try {
            eval(beDOMNode.commands);
        } catch (e) {
            console.error('Error evaluating BeDOM script:' + e);
        }
    });
};

module.exports = {
    execute: execute
};