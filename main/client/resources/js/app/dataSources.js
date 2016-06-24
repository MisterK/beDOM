var registeredDataSources = {};

var getDataSource = function(name) {
    var dataSource = registeredDataSources[name];
    if (!_.isObject(dataSource)) {
        dataSource = {
            name: name,
            fields: {},
            getField: function(fieldName) {
                var field = this.fields[fieldName];
                if (!_.isObject(field)) {
                    field = {
                        value: '',
                        listeners: []
                    };
                    this.fields[fieldName] = field;
                }
                return field;
            },
            setFieldValue: function(fieldName, newValue) {
                var dataSourceName = this.name;
                var field = this.getField(fieldName);
                var oldValue = field.value;
                if (oldValue != newValue) {
                    console.log('=> Setting new value "' + newValue + '" on field "' + fieldName
                        + '" in dataSource "' + this.name + "'");
                    field.value = newValue;
                    _.each(field.listeners, function(listener) {
                       listener(dataSourceName, fieldName, newValue, oldValue)
                    });
                }
            },
            registerFieldListener: function(fieldName, listener) {
                this.getField(fieldName).listeners.push(listener);
            }
        };
        registeredDataSources[name] = dataSource;
    }
    return dataSource;
};

var persistDataChanges = function(dataChanges) {
    console.log('=> ' + dataChanges.length + ' dataChange(s) to be applied');
    _.each(dataChanges, function(dataChange) {
        getDataSource(dataChange.dataSourceName)
            .setFieldValue(dataChange.fieldName, dataChange.newValue);
    });
};

module.exports = {
    getDataSource: getDataSource,
    persistDataChanges: persistDataChanges
};