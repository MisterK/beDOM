module.exports = function(executionContext, beDOMNodes, currentBeDOMNode) {
    var registeredActionCallbacks = [];

    var bindEventOnBeDOMNode = function(event) {
        var targetBeDOMNode = event.data;
        if (_.isUndefined(targetBeDOMNode)) {
            console.error('Could not find related beDOMNode when receiving event on DOM node');
            return this;
        }
        _(targetBeDOMNode.triggerContexts).filter(function(triggerContext) {
            return triggerContext.trigger.bindingEvent == event.type; //Retrieve the trigger contexts for the given event
        }).filter(function(triggerContext) {
            return triggerContext.trigger.triggerFunction(targetBeDOMNode.targetDOMNode); //Keep the ones that were activated
        }).groupBy(function(triggerContext) {
            return triggerContext.targetBeDOMNode.targetTagId;
        }).values().each(function (triggerContextsForBeDOMElement) {
            //console.log(triggerContextsForBeDOMElement);
            var transFunctors = _(triggerContextsForBeDOMElement).map(function(triggerContextForBeDOMElement) {
                return _.map(triggerContextForBeDOMElement.actionCallbacks, function(actionCallback) {
                    return actionCallback.transFunctors;
                });
            }).flatten().value();
            //console.log(transFunctors);
            var reducedTransfunctors = transFunctors[0].composeTransFunctors(transFunctors);
            var result = reducedTransfunctors.transFunction('blah', triggerContextsForBeDOMElement[0].targetBeDOMNode);
            //console.log(result);
            /*console.log('Found triggerContextsForBeDOMElement for element "' + targetBeDOMNode.targetTagId
                + '" for trigger "' + triggerContextsForBeDOMElement.trigger.name
                + '" with ' + triggerContextsForBeDOMElement.actionCallbacks.length + ' actionCallback(s) to execute');
            //TODO Compose the actionCallbacks to get the final transformed beDOMElement
            _.reduce(triggerContextsForBeDOMElement.actionCallbacks, function(actionCallback) {
                actionCallback.transFunctors(actionCallback.actionArgs, triggerContextsForBeDOMElement.targetBeDOMNode);
            });*/
        });
    };

    return {
        do: function(actionName, actionArgs) {
            //Check has functors for action
            var transFunctors = executionContext.transFunctors.getTransFunctorsByNameForArgs(actionName, actionArgs);
            if (_.isObject(transFunctors)) {
                //Register callback
                registeredActionCallbacks.push({
                    actionName: actionName, //TODO remove?
                    actionArgs: actionArgs, //TODO remove?
                    transFunctors: transFunctors
                });
            }
            return this;
        },
        when: function(triggerName, triggerArgs) {
            var targetBeDOMNode = currentBeDOMNode;
            var triggerAction = triggerName;
            //If trigger is on another element
            if (triggerName == 'ELEMENT') {
                var targetTagId = triggerArgs[0];
                targetBeDOMNode = _.find(beDOMNodes, function(beDOMNode) {
                    return beDOMNode.targetTagId == targetTagId;
                });
                if (_.isUndefined(targetBeDOMNode)) {
                    console.error('Could not find target beDOMNode of id ' + targetTagId);
                    return this;
                }
                triggerAction = triggerArgs[1];
            }
            var targetTrigger = executionContext.triggers.getTriggerByName(triggerAction);
            if (_.isUndefined(targetTrigger)) {
                console.error('No triggers registered for this trigger name ' + triggerAction);
                return this;
            }
            //If event has never been bound before for current node
            if (_.isUndefined(_.find(targetBeDOMNode.triggerContexts, function(triggerContext) {
                    return triggerContext.trigger.bindingEvent == targetTrigger.bindingEvent;
                }))) {
                //Bind listener function to current node
                targetBeDOMNode.targetDOMNode.on(targetTrigger.bindingEvent, targetBeDOMNode, bindEventOnBeDOMNode);
            }
            //Register current action callbacks to BeDOMNode for trigger
            targetBeDOMNode.triggerContexts.push({
                trigger: targetTrigger,
                targetBeDOMNode: currentBeDOMNode,
                actionCallbacks: _.clone(registeredActionCallbacks)
            });
            //Clean state
            registeredActionCallbacks.length = 0;
            return this;
        },
        andRevertOtherwise: function() {
            //TODO register functor to revert to original hnode + register opposite event listener which triggers that functor
            return this;
        },
        captureValueFor: function() {
            //TODO register capture value into stor functor + register event listener on tag which triggers that functor
            return this;
        },
        displayValueFrom: function() {
            //TODO register display functor + register event listener on datasource which triggers that functor
            return this;
        }
    };
};