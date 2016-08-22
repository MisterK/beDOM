var dataSourceEventListener = require('../listeners/dataSourceEventListener.js');
var transformer = require('../transformer.js');

var registerListenerOnDataSourceField = function(executionContext, currentBeDOMNode, dataSourceName, fieldName,
                                                 newValue, oldValue) {
    transformer.applyTransformations(executionContext,
        dataSourceEventListener.getTransformationsForDataSourceEvent(
            executionContext, currentBeDOMNode, dataSourceName, fieldName, newValue, oldValue));
};

var bindListenersToDataSourceField = function(executionContext) {
    console.log('============= Binding listeners to dataSource fields phase ==============');
    _.map(executionContext.beDOMNodes, function(beDOMNode) {
        return _(beDOMNode.dataSourceListenerContexts)
            .groupBy(function (dataSourceListenerContext) {
                return dataSourceListenerContext.triggerContext.dataSourceName
                    + "/" + dataSourceListenerContext.triggerContext.fieldName;
            })
            .mapValues(function(domEventListenerContexts) { return domEventListenerContexts[0]; })
            .forEach(function(listenerContext) {
                executionContext.dataSources.getDataSource(listenerContext.triggerContext.dataSourceName)
                    .registerFieldListener(listenerContext.triggerContext.fieldName,
                        _.curry(registerListenerOnDataSourceField, 6)(executionContext, beDOMNode));
                console.log('=> Registered listener on dataSource "'
                    + listenerContext.triggerContext.dataSourceName
                    + '" and field "' + listenerContext.triggerContext.fieldName + '"');
            });
    });
    console.log("==============================================");
    return executionContext;
};

module.exports = {
    bindListenersToDataSourceField: bindListenersToDataSourceField
};