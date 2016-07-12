var Trigger = require('./trigger.js');

var alwaysTrue = function() {
    return true;
};

var namedEventTrigger = function(triggerName, triggerEventName, domTriggerFunction, dataSourceTriggerFunction) {
    return new Trigger(triggerName, triggerEventName,
        domTriggerFunction || alwaysTrue, dataSourceTriggerFunction || alwaysTrue);
};

module.exports = [namedEventTrigger('CHANGES', 'change')]; //TODO add more