var listenerContextsForDataSourceField = function(dataSourceName, fieldName) {
    return function(dataSourceListenerContext) {
        return dataSourceListenerContext.triggerContext.dataSourceName == dataSourceName
            && dataSourceListenerContext.triggerContext.fieldName == fieldName;
    };
};

var activatedDataSourceListenerContexts = function(currentBeDOMNode, newValue, oldValue) {
    return function(dataSourceListenerContext) {
        return dataSourceListenerContext.trigger.dataSourceTriggerFunction(
            currentBeDOMNode, dataSourceListenerContext.triggerArguments, newValue, oldValue);
    };
};

var transFunctorsForDataSourceListenerContext = function(dataSourceListenerContext) {
    return _.map(dataSourceListenerContext.actionCallbacks, function(actionCallback) {
        return actionCallback.transFunctors;
    });
};

var transFunctorForValueChange = function(executionContext, newValue, oldValue) {
    return function(transFunctor) {
        if (transFunctor.name == 'REFRESH_VALUE') {  //TODO remove if, do for all
            //TODO rather do something like transFunctor.getForArgs([newValue, oldValue]);
            return executionContext.transFunctors.getTransFunctorsByNameForArgs(
                'REFRESH_VALUE', [newValue, oldValue]);
        } else {
            return transFunctor;
        }
    };
};

var getTransformationsForDataSourceEvent = function(executionContext, currentBeDOMNode,
                                                    dataSourceName, fieldName, newValue, oldValue) {
    console.log('============== DataSource Listener =======================');
    console.log('Listener triggered on dataSource "'
        + dataSourceName + '" and field "' + fieldName
        + '" for BeDOMNode "' + currentBeDOMNode.targetTagId + '"');

    var transFunctors = _(currentBeDOMNode.dataSourceListenerContexts)
        .filter(listenerContextsForDataSourceField(dataSourceName, fieldName))
        .filter(activatedDataSourceListenerContexts(currentBeDOMNode, newValue, oldValue))
        .map(transFunctorsForDataSourceListenerContext)
        .flatten()
        .map(transFunctorForValueChange(executionContext, newValue, oldValue))
        .value();
    console.log('  => ' + transFunctors.length + ' transFunctor(s) found for BeDOMNode "'
        + currentBeDOMNode.targetTagId + '"');
    if (transFunctors.length == 0) { //TODO Minor: return Absent => flatten
        return {
            targetBeDOMNode: currentBeDOMNode,
            resultingHScript: currentBeDOMNode.hscript,
            dataChanges: currentBeDOMNode.dataChanges
        };
    }

    //Compose all transFunctors into one
    var reducedTransfunctors = transFunctors[0].composeTransFunctors(transFunctors);
    //Execute composed transFunction
    var resultBeDOMNode = reducedTransfunctors.transFunction(currentBeDOMNode, currentBeDOMNode); //TODO what should be the input?

    return {
        targetBeDOMNode: currentBeDOMNode,
        resultingHScript: resultBeDOMNode.hscript,
        dataChanges: resultBeDOMNode.dataChanges
    };
};

module.exports = {
    getTransformationsForDataSourceEvent: getTransformationsForDataSourceEvent
};