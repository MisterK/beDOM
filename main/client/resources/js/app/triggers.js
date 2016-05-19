var registeredTriggers = {};

var addTrigger = function(trigger) {
    registeredTriggers[trigger.name] = trigger;
};

var getTriggerByName = function(triggerName) {
    return registeredTriggers[triggerName];
};

module.exports = {
    addTrigger: addTrigger,
    getTriggerByName: getTriggerByName
};