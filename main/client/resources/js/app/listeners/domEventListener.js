var listenerContextsForDOMEventType = function(eventType) {
    return function(listenerContext) {
        return listenerContext.trigger.triggerEventName == eventType;
    }
};

var activatedListenerContexts = function(eventTargetBeDOMNode) {
    return function(listenerContext) {
        return listenerContext.trigger.domTriggerFunction(
            eventTargetBeDOMNode.targetDOMNode, listenerContext.triggerArguments);
    };
};

var transfunctorsForListenerContext = function(listenerContextForBeDOMElement) {
    return _.map(listenerContextForBeDOMElement.actionCallbacks, function(actionCallback) {
        return actionCallback.transFunctors;
    });
};

var getTransformationsForDOMEvent = function(event, eventTargetBeDOMNode) {
    console.log('============== Event =======================');
    console.log('Event "' + event.type + '" triggered on BeDOMNode "' + eventTargetBeDOMNode.targetTagId + '"');

    return _(eventTargetBeDOMNode.domEventListenerContexts)
        .filter(listenerContextsForDOMEventType(event.type))
        .filter(activatedListenerContexts(eventTargetBeDOMNode))
        .groupBy(function(listenerContext) { return listenerContext.targetBeDOMNode.targetTagId; })
        .mapValues(function (listenerContextsForBeDOMElement) {
            var targetBeDOMNode = listenerContextsForBeDOMElement[0].targetBeDOMNode;
            console.log('  => ' + listenerContextsForBeDOMElement.length + ' listenerContext(s) found for BeDOMNode "'
                + targetBeDOMNode.targetTagId+ '"');

            var transFunctors = _(listenerContextsForBeDOMElement)
                .map(transfunctorsForListenerContext).flatten().value();
            console.log('    => ' + transFunctors.length + ' transFunctor(s) found for BeDOMNode "'
                + targetBeDOMNode.targetTagId + '"');
            if (transFunctors.length == 0) { //TODO Minor: return Absent => flatten
                return {
                    targetBeDOMNode: targetBeDOMNode,
                    resultingHScript: targetBeDOMNode.hscript,
                    dataChanges: targetBeDOMNode.dataChanges
                };
            }

            //Compose all transFunctors into one
            var reducedTransfunctors = transFunctors[0].composeTransFunctors(transFunctors);
            //Execute composed transFunction
            var resultBeDOMNode = reducedTransfunctors.transFunction(targetBeDOMNode, targetBeDOMNode); //TODO what should be the input?

            return {
                targetBeDOMNode: targetBeDOMNode,
                resultingHScript: resultBeDOMNode.hscript,
                dataChanges: resultBeDOMNode.dataChanges
            };
        });
};

module.exports = {
    getTransformationsForDOMEvent: getTransformationsForDOMEvent
};