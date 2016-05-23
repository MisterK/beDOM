var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

module.exports = function(executionContext, beDOMNodes, currentBeDOMNode) {
    var registeredActionCallbacks = [];

    var bindEventOnBeDOMNode = function(event) { //TODO move to other module
        var eventTargetBeDOMNode = event.data;
        if (_.isUndefined(eventTargetBeDOMNode)) {
            console.error('Could not find related beDOMNode when receiving event on DOM node');
            return this;
        }
	    console.log('============== Event =======================');
        console.log('Event "' + event.type + '" triggered on BeDOMNode "' + eventTargetBeDOMNode.targetTagId + '"');
        _(eventTargetBeDOMNode.triggerContexts).filter(function(triggerContext) {
            return triggerContext.trigger.bindingEvent == event.type; //Retrieve the trigger contexts for the given event
        }).filter(function(triggerContext) {
            return triggerContext.trigger.triggerFunction(
                eventTargetBeDOMNode.targetDOMNode, triggerContext.triggerArguments); //Keep the ones that were activated
        }).groupBy(function(triggerContext) {
            return triggerContext.targetBeDOMNode.targetTagId;
        }).values().each(function (triggerContextsForBeDOMElement) {
            var targetBeDOMNode = triggerContextsForBeDOMElement[0].targetBeDOMNode;
            console.log('  => ' + triggerContextsForBeDOMElement.length + ' triggerContext(s) found for BeDOMNode "'
                + targetBeDOMNode.targetTagId+ '"');
            //Get all transfunctors for all activated triggerContexts
            var transFunctors = _(triggerContextsForBeDOMElement).map(function(triggerContextForBeDOMElement) {
                return _.map(triggerContextForBeDOMElement.actionCallbacks, function(actionCallback) {
                    return actionCallback.transFunctors;
                });
            }).flatten().value();
            console.log('  => ' + transFunctors.length + ' transFunctor(s) found for BeDOMNode "'
                + targetBeDOMNode.targetTagId + '"');
            //Compose all transFunctors into one
            var reducedTransfunctors = transFunctors[0].composeTransFunctors(transFunctors);
            //Execute composed transFunction
            var resultBeDOMNode = reducedTransfunctors.transFunction('blah', targetBeDOMNode); //TODO what should be the input?
            //Calculate resulting diffs between original hscript and resulting hscript
            var patches = diff(targetBeDOMNode.hscript, resultBeDOMNode.hscript);
            if (_.isObject(patches[0])) {
                console.log('=> DOM patches to be applied on BeDOMNode "' + targetBeDOMNode.targetTagId + '"');
            } else {
                console.log('=> No DOM patches to be applied on BeDOMNode "' + targetBeDOMNode.targetTagId + '"');
            }

            //TODO Later: _.map and return targetDOMNode with patches to apply, and dataChanges, and let the calling code do the execution
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

    var registerListenerOnDataSourceField = function(dataSourceName, fieldName, newValue, oldValue) { //TODO move to other module
        console.log('============== DataSource Listener =======================');
        console.log('Listener triggered on dataSource "'
            + dataSourceName + '" and field "' + fieldName
            + '" for BeDOMNode "' + currentBeDOMNode.targetTagId + '"');

        //Get all transfunctors for all dataSourceListenerContexts
        var transFunctors = _(currentBeDOMNode.dataSourceListenerContexts)
            .filter(function(dataSourceListenerContext) {
                return dataSourceListenerContext.dataSourceName == dataSourceName
                    && dataSourceListenerContext.fieldName == fieldName; //Retrieve the listener contexts for the given data source and field
            }).map(function(dataSourceListenerContext) {
                return _.map(dataSourceListenerContext.actionCallbacks, function(actionCallback) {
                    return actionCallback.transFunctors;
                });
            }).flatten().map(function(transFunctor) {
                if (transFunctor.name == 'REFRESH_VALUE') {
                    return executionContext.transFunctors.getTransFunctorsByNameForArgs(
                        'REFRESH_VALUE', [newValue, oldValue]);
                } else {
                    return transFunctor;
                }
            }).value();

        console.log('  => ' + transFunctors.length + ' transFunctor(s) found for BeDOMNode "'
            + currentBeDOMNode.targetTagId + '"');
        //Compose all transFunctors into one
        var reducedTransfunctors = transFunctors[0].composeTransFunctors(transFunctors);
        //Execute composed transFunction
        var resultBeDOMNode = reducedTransfunctors.transFunction('blah', currentBeDOMNode); //TODO what should be the input?
        //Calculate resulting diffs between original hscript and resulting hscript
        var patches = diff(currentBeDOMNode.hscript, resultBeDOMNode.hscript);
        if (_.isObject(patches[0])) {
            console.log('=> DOM patches to be applied');
        } else {
            console.log('=> No DOM patches to be applied');
        }

        //TODO Later: return targetDOMNode with patches to apply, and dataChanges, and let the calling code do the execution
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
        currentBeDOMNode.hscript = resultBeDOMNode.hscript;
        currentBeDOMNode.dataChanges.length = 0;
    };

    return {
        do: function(actionName, actionArgs) {
            //Check has functors for action
            var transFunctors = executionContext.transFunctors.getTransFunctorsByNameForArgs(actionName, actionArgs || []);
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
            var triggerArguments = triggerArgs || [];
            //If trigger is on dataSource
            if (triggerName == 'DATA_SOURCE') {
                var dataSourceName = triggerArgs[0];
                if (!_.isString(dataSourceName)) {
                    console.error('DataSourceName required as first argument');
                    return this;
                }
                var fieldName = triggerArgs[1];
                if (!_.isString(fieldName)) {
                    console.error('FieldName required as first argument');
                    return this;
                }
                if (triggerArgs[2] != 'CHANGES') { //TODO Later: other types of triggers on dataSources
                    console.error('Unknown trigger "' + triggerArgs[2] + "' for dataSource");
                    return this;
                }
                //If listener has never been register on dataSource for field before for current node
                if (_.isUndefined(_.find(targetBeDOMNode.dataSourceListenerContexts,
                        function(dataSourceListenerContext) {
                            return dataSourceListenerContext.dataSourceName == dataSourceName
                                && dataSourceListenerContext.fieldName == fieldName;
                    }))) {
                    //Bind listener function to current node
                    executionContext.dataSources.getDataSource(dataSourceName)
                        .registerFieldListener(fieldName, registerListenerOnDataSourceField);
                    console.log('=> Registered listener on dataSource "'
                        + dataSourceName + '" and field "' + fieldName + '"');
                }
                //Register current action callbacks to BeDOMNode for dataSource listener
                targetBeDOMNode.dataSourceListenerContexts.push({
                    dataSourceName: dataSourceName,
                    fieldName: fieldName,
                    actionCallbacks: _.clone(registeredActionCallbacks)
                });
                console.log('=> Registered ' + registeredActionCallbacks.length + ' callbacks for BeDOMNode "'
                    + currentBeDOMNode.targetTagId + '", for dataSource "'
                    + dataSourceName + '" and field "' + fieldName + '"');
            } else {
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
                    console.log('=> Bound event "' + targetTrigger.bindingEvent
                        + '" on target BeDOMNode "' + targetBeDOMNode.targetTagId + '"');
                }
                //Register current action callbacks to BeDOMNode for trigger
                targetBeDOMNode.triggerContexts.push({
                    trigger: targetTrigger,
                    triggerArguments: triggerArguments,
                    targetBeDOMNode: currentBeDOMNode,
                    actionCallbacks: _.clone(registeredActionCallbacks)
                });
                console.log('=> Registered ' + registeredActionCallbacks.length + ' actionCallbacks for BeDOMNode "'
                    + currentBeDOMNode.targetTagId + '", for trigger "'
                    + triggerAction + '" on target BeDOMNode "' + targetBeDOMNode.targetTagId + '"');
            }

            //Clean state
            registeredActionCallbacks.length = 0;
            return this;
        },
        andRevertOtherwise: function() {
            //TODO register functor to revert to original hnode + register opposite event listener which triggers that functor
            return this;
        }
    };
};
