var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

module.exports = function(executionContext, beDOMNodes, currentBeDOMNode) {
    var registeredActionCallbacks = [];

    var bindEventOnBeDOMNode = function(event) {
        var eventTargetBeDOMNode = event.data;
        if (_.isUndefined(eventTargetBeDOMNode)) {
            console.error('Could not find related beDOMNode when receiving event on DOM node');
            return this;
        }
        console.log('Event ' + event.type + ' triggered on BeDOMNode ' + eventTargetBeDOMNode.targetTagId);
        _(eventTargetBeDOMNode.triggerContexts).filter(function(triggerContext) {
            return triggerContext.trigger.bindingEvent == event.type; //Retrieve the trigger contexts for the given event
        }).filter(function(triggerContext) {
            return triggerContext.trigger.triggerFunction(
                eventTargetBeDOMNode.targetDOMNode, triggerContext.triggerArguments); //Keep the ones that were activated
        }).groupBy(function(triggerContext) {
            return triggerContext.targetBeDOMNode.targetTagId;
        }).values().each(function (triggerContextsForBeDOMElement) {
            var targetBeDOMNode = triggerContextsForBeDOMElement[0].targetBeDOMNode;
            console.log('=> ' + triggerContextsForBeDOMElement.length + ' triggerContext(s) found for BeDOMNode '
                + targetBeDOMNode.targetTagId);
            //Get all transfunctors for all activated triggerContexts
            var transFunctors = _(triggerContextsForBeDOMElement).map(function(triggerContextForBeDOMElement) {
                return _.map(triggerContextForBeDOMElement.actionCallbacks, function(actionCallback) {
                    return actionCallback.transFunctors;
                });
            }).flatten().value();
            console.log('=> ' + transFunctors.length + ' transFunctor(s) found for BeDOMNode '
                + targetBeDOMNode.targetTagId);
            //Compose all transFunctors into one
            var reducedTransfunctors = transFunctors[0].composeTransFunctors(transFunctors);
            //Execute composed transFunction
            var resultBeDOMNode = reducedTransfunctors.transFunction('blah', targetBeDOMNode);
            //Calculate resulting diffs between original hscript and resulting hscript
            var patches = diff(targetBeDOMNode.hscript, resultBeDOMNode.hscript);
            if (_.isObject(patches[0])) {
                console.log('=> DOM patches to be applied');
            } else {
                console.log('=> No DOM patches to be applied');
            }

            //TODO Later: Part with side-effect, move this to Monet.IO
            //Apply changes to DOM
            patch(resultBeDOMNode.targetDOMNode[0], patches);
            //Persist data changes
            console.log('=> ' + resultBeDOMNode.dataChanges.length + ' dataChange(s) to be applied');
            _.each(resultBeDOMNode.dataChanges, function(dataChange) {
                executionContext.dataSources.getDataSource(dataChange.dataSourceName)
                    .setFieldValue(dataChange.fieldName, dataChange.newValue);
            });
            //Clean (Mutate) original node, as it's the new cycle
            targetBeDOMNode.hscript = resultBeDOMNode.hscript;
            targetBeDOMNode.dataChanges.length = 0;
        });
    };

    return {
        do: function(actionName, actionArgs) {
            //Check has functors for action
            var transFunctors = executionContext.transFunctors.getTransFunctorsByNameForArgs(actionName, actionArgs);
            if (_.isObject(transFunctors)) {
                //Register callback
                registeredActionCallbacks.push({
                    transFunctors: transFunctors
                });
            }
            return this;
        },
        when: function(triggerName, triggerArgs) {
            var targetBeDOMNode = currentBeDOMNode;
            var triggerAction = triggerName;
            var triggerArguments = triggerArgs;
            //If trigger is on another element
            if (triggerName == 'ELEMENT') {
                var targetTagId = triggerArgs[0];
                targetBeDOMNode = _.find(beDOMNodes, function(beDOMNode) {
                    return beDOMNode.targetTagId == targetTagId;
                });
                if (_.isUndefined(targetBeDOMNode)) {
                    //TODO handle DOMNode by itself, without having to transform it into a beDOMNode
                    console.error('Could not find target beDOMNode of id ' + targetTagId);
                    return this;
                }
                triggerAction = triggerArgs[1];
                triggerArguments = triggerArgs[2] || [];
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
                triggerArguments: triggerArguments,
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
        displayValueFrom: function() {
            //TODO register display functor + register event listener on datasource which triggers that functor
            return this;
        }
    };
};