var ListenerContext = function(trigger, triggerContext, triggerArguments, targetBeDOMNode, actionCallbacks) {
    this.trigger = trigger;
    this.triggerContext = triggerContext;
    this.triggerArguments = triggerArguments;
    this.targetBeDOMNode = targetBeDOMNode;
    this.actionCallbacks = actionCallbacks;
};

module.exports = ListenerContext;