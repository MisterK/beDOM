var registeredTriggers = {};

var addTrigger = function(trigger) {
    registeredTriggers[trigger.name] = trigger;
};

var getTriggerByName = function(triggerName) {
    return registeredTriggers[triggerName];
};

var addTriggers = function(triggers) {
    if (!_.isArray(triggers)) {
        triggers = [triggers];
    }
    _.each(triggers, addTrigger);
};

module.exports = {
    addTriggers: addTriggers,
    getTriggerByName: getTriggerByName
};