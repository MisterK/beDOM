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
                var field = this.getField(fieldName);
                var oldValue = field.value;
                if (oldValue != newValue) {
                    console.log('=> Setting new value "' + newValue + '" on field "' + fieldName
                        + '" in dataSource "' + this.name + "'");
                    field.value = newValue;
                    _.each(field.listeners, function(listener) {
                       listener(newValue, oldValue)
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

module.exports = {
    getDataSource: getDataSource
};