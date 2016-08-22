var ListenerContext = function(trigger, triggerContext, triggerArguments, targetBeDOMNode, actionCallbacks) {
    this.trigger = trigger;
    this.triggerContext = triggerContext;
    this.triggerArguments = triggerArguments;
    this.targetBeDOMNode = targetBeDOMNode; //TODO: rather rely on targetTagId and fetch nodes on each event?
    this.actionCallbacks = actionCallbacks;
};

module.exports = ListenerContext;