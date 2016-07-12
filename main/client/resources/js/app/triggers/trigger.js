var Trigger = function(triggerName, triggerEventName, domTriggerFunction, dataSourceTriggerFunction) {
    this.name = triggerName;
    this.triggerEventName = triggerEventName;
    this.domTriggerFunction = domTriggerFunction;
    this.dataSourceTriggerFunction = dataSourceTriggerFunction;
};

module.exports = Trigger;