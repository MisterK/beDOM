var domEventListener = require('../listeners/domEventListener.js');
var transformer = require('../transformer.js');

var bindEventOnBeDOMNode = function(executionContext, currentBeDOMNode, event) {
    _(domEventListener.getTransformationsForDOMEvent(event, currentBeDOMNode))
        .each(_.curry(transformer.applyTransformations, 2)(executionContext));
};

var bindListenersToDOMEvents = function(executionContext) {
    console.log('============= Binding listeners to DOM events phase ==============');
    _.map(executionContext.beDOMNodes, function(beDOMNode) {
        return _(beDOMNode.domEventListenerContexts)
            .groupBy(function (listenerContext) {
                return listenerContext.trigger.triggerEventName;
            })
            .mapValues(function(domEventListenerContexts) { return domEventListenerContexts[0]; })
            .forEach(function(listenerContext) {
                beDOMNode.targetDOMNode.on(listenerContext.trigger.triggerEventName, beDOMNode,
                    _.curry(bindEventOnBeDOMNode, 3)(executionContext, beDOMNode));
                console.log('=> Bound event "' + listenerContext.trigger.triggerEventName
                    + '" on target BeDOMNode "' + beDOMNode.targetTagId + '"');
            });
    });
    console.log("==============================================");
    return executionContext;
};

module.exports = {
  bindListenersToDOMEvents: bindListenersToDOMEvents
};