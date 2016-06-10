module.exports = {
    name: 'CAPTURE_VALUE_FOR',
    transFunction: function(source, beDOMNode) {
        var actionArgs = (this.actionArgs || []);
        var dataSourceName = actionArgs[0];
        if (!_.isString(dataSourceName)) {
            console.error('DataSourceName required as first argument');
        }
        var fieldName = actionArgs[1];
        if (!_.isString(fieldName)) {
            console.error('FieldName required as first argument');
        }
        console.log('    ==> executing transFunctor: "' + this.name
            + '", dataSourceName: "' + dataSourceName + '", fieldName: "' + fieldName + '"');

        return beDOMNode.addDataChange({
            dataSourceName: dataSourceName,
            fieldName: fieldName,
            newValue: $.trim(beDOMNode.targetDOMNode.val()) //TODO Bug: should read from VText
        });
    }
};