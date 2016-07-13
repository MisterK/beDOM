var domEventListener = require('./listeners/domEventListener.js');
var dataSourceEventListener = require('./listeners/dataSourceEventListener.js');
var ListenerContext = require('./listeners/listenerContext.js');

var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var applyTransformation = function(executionContext) {
    return function (transformation) {
        //Calculate resulting diffs between original hscript and resulting hscript
        var patches = diff(transformation.targetBeDOMNode.hscript, transformation.resultingHScript);
        if (_.isObject(patches[0])) {
            console.log('=> DOM patches to be applied on BeDOMNode "'
                + transformation.targetBeDOMNode.targetTagId + '"');
        } else {
            console.log('=> **No** DOM patches to be applied on BeDOMNode "'
                + transformation.targetBeDOMNode.targetTagId + '"');
        }

        //TODO Later: Part with side-effect, move this to Monet.IO
        //Apply changes to DOM
        patch(transformation.targetBeDOMNode.targetDOMNode[0], patches);
        //Clean (Mutate) original node, as it's the new cycle
        transformation.targetBeDOMNode.clear(transformation.resultingHScript);
        //Persist data changes
        executionContext.dataSources.persistDataChanges(transformation.dataChanges);
    };
};

var bindEventOnBeDOMNode = function(executionContext) {
    return function(event) {
        _(domEventListener.getTransformationsForDOMEvent(event))
            .each(applyTransformation(executionContext));
    };
};

var registerListenerOnDataSourceField = function(executionContext, currentBeDOMNode) {
    return function(dataSourceName, fieldName, newValue, oldValue) {
        applyTransformation(executionContext)(
            dataSourceEventListener.getTransformationsForDataSourceEvent(
                executionContext, currentBeDOMNode, dataSourceName, fieldName, newValue, oldValue));
    };
};

module.exports = function(executionContext, beDOMNodes, currentBeDOMNode) {
    var registeredActionCallbacks = [];

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
            if (_.isUndefined(_.find(targetBeDOMNode.domEventTriggerContexts, function(triggerContext) {
                    return triggerContext.trigger.triggerEventName == targetTrigger.triggerEventName;
                }))) {
                //Bind listener function to current node
                targetBeDOMNode.targetDOMNode.on(targetTrigger.triggerEventName, targetBeDOMNode,
                    bindEventOnBeDOMNode(executionContext));
                console.log('=> Bound event "' + targetTrigger.triggerEventName
                    + '" on target BeDOMNode "' + targetBeDOMNode.targetTagId + '"');
            }
            //Register current action callbacks to BeDOMNode for trigger
            targetBeDOMNode.domEventTriggerContexts.push(
                new ListenerContext(
                    targetTrigger, {}, triggerArguments, currentBeDOMNode, _.clone(registeredActionCallbacks)));
            console.log('=> Registered ' + registeredActionCallbacks.length + ' actionCallbacks for BeDOMNode "'
                + currentBeDOMNode.targetTagId + '", for trigger "'
                + triggerAction + '" on target BeDOMNode "' + targetBeDOMNode.targetTagId + '"');

            //Clean state
            registeredActionCallbacks.length = 0;
            return this;
        },
        whenDataSourceField: function(dataSourceFieldArgs, triggerName, triggerArgs) {
            var targetBeDOMNode = currentBeDOMNode;
            var dataSourceName = dataSourceFieldArgs[0];
            if (!_.isString(dataSourceName)) {
                console.error('DataSourceName required as first argument');
                return this;
            }
            var fieldName = dataSourceFieldArgs[1];
            if (!_.isString(fieldName)) {
                console.error('FieldName required as first argument');
                return this;
            }
            var triggerAction = triggerName;
            var triggerArguments = triggerArgs || [];
            var targetTrigger = executionContext.triggers.getTriggerByName(triggerAction);
            if (_.isUndefined(targetTrigger)) {
                console.error('No triggers registered for this trigger name ' + triggerAction);
                return this;
            }
            //If listener has never been registered on dataSource for field before for current node
            if (_.isUndefined(_.find(targetBeDOMNode.dataSourceListenerContexts,
                    function(dataSourceListenerContext) {
                        return dataSourceListenerContext.triggerContext.dataSourceName == dataSourceName
                            && dataSourceListenerContext.triggerContext.fieldName == fieldName;
                    }))) {
                //Bind listener function to current node
                executionContext.dataSources.getDataSource(dataSourceName)
                    .registerFieldListener(fieldName,
                        registerListenerOnDataSourceField(executionContext, targetBeDOMNode));
                console.log('=> Registered listener on dataSource "'
                    + dataSourceName + '" and field "' + fieldName + '"');
            }
            //Register current action callbacks to BeDOMNode for dataSource listener
            targetBeDOMNode.dataSourceListenerContexts.push(
                new ListenerContext(targetTrigger,
                    { dataSourceName: dataSourceName, fieldName: fieldName },
                    triggerArguments, currentBeDOMNode, _.clone(registeredActionCallbacks)));
            console.log('=> Registered ' + registeredActionCallbacks.length + ' callbacks for BeDOMNode "'
                + currentBeDOMNode.targetTagId + '", for dataSource "'
                + dataSourceName + '" and field "' + fieldName + '"');

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
