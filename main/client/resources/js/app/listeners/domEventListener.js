var triggerContextsForDOMEventType = function(eventType) {
    return function(triggerContext) {
        return triggerContext.trigger.triggerEventName == eventType;
    }
};

var activatedTriggerContexts = function(eventTargetBeDOMNode) {
    return function(triggerContext) {
        return triggerContext.trigger.domTriggerFunction(
            eventTargetBeDOMNode.targetDOMNode, triggerContext.triggerArguments);
    };
};

var transfunctorsForTriggerContext = function(triggerContextForBeDOMElement) {
    return _.map(triggerContextForBeDOMElement.actionCallbacks, function(actionCallback) {
        return actionCallback.transFunctors;
    });
};

var getTransformationsForDOMEvent = function(event) {
    var eventTargetBeDOMNode = event.data;
    if (_.isUndefined(eventTargetBeDOMNode)) {
        console.error('Could not find related beDOMNode when receiving event on DOM node');
        return [];
    }
    console.log('============== Event =======================');
    console.log('Event "' + event.type + '" triggered on BeDOMNode "' + eventTargetBeDOMNode.targetTagId + '"');

    return _(eventTargetBeDOMNode.domEventTriggerContexts)
        .filter(triggerContextsForDOMEventType(event.type))
        .filter(activatedTriggerContexts(eventTargetBeDOMNode))
        .groupBy(function(triggerContext) { return triggerContext.targetBeDOMNode.targetTagId; })
        .values()
        .map(function (triggerContextsForBeDOMElement) {
            var targetBeDOMNode = triggerContextsForBeDOMElement[0].targetBeDOMNode;
            console.log('  => ' + triggerContextsForBeDOMElement.length + ' triggerContext(s) found for BeDOMNode "'
                + targetBeDOMNode.targetTagId+ '"');

            var transFunctors = _(triggerContextsForBeDOMElement)
                .map(transfunctorsForTriggerContext).flatten().value();
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