var namedEventTrigger = function(triggerName, triggerEventName) {
    return {
        name: triggerName,
        bindingEvent: triggerEventName,
        triggerFunction: function() {
            return true;
        }
    }
};

module.exports = [namedEventTrigger('CHANGES', 'change')]; //TODO add more