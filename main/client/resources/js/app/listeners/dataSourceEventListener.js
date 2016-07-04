var listenerContextsForDataSourceField = function(dataSourceName, fieldName) {
    return function(dataSourceListenerContext) {
        return dataSourceListenerContext.dataSourceName == dataSourceName
            && dataSourceListenerContext.fieldName == fieldName;
    };
};

var transFunctorsForDataSourceListenerContext = function(dataSourceListenerContext) {
    return _.map(dataSourceListenerContext.actionCallbacks, function(actionCallback) {
        return actionCallback.transFunctors;
    });
};

var transFunctorForValueChange = function(executionContext, newValue, oldValue) {
    return function(transFunctor) {
        if (transFunctor.name == 'REFRESH_VALUE') {
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

    //Get all transfunctors for all dataSourceListenerContexts
    var transFunctors = _(currentBeDOMNode.dataSourceListenerContexts)
        .filter(listenerContextsForDataSourceField(dataSourceName, fieldName))
        .map(transFunctorsForDataSourceListenerContext)
        .flatten()
        .map(transFunctorForValueChange(executionContext, newValue, oldValue))
        .value();
    console.log('  => ' + transFunctors.length + ' transFunctor(s) found for BeDOMNode "'
        + currentBeDOMNode.targetTagId + '"');

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