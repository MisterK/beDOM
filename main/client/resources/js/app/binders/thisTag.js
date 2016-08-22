var ListenerContext = require('../listeners/listenerContext.js');

var ThisTag = function(executionContext) {
    this.executionContext = executionContext;
    this.registeredActionCallbacks = [];
    this.currentBeDOMNode = undefined;
};

/*** Bindable private methods ***/
var whenEventOccurs = function(currentBeDOMNode, triggerAction, triggerArguments, targetBeDOMNode) {
    var targetTrigger = this.executionContext.triggers.getTriggerByName(triggerAction);
    if (_.isUndefined(targetTrigger)) {
        console.error('No triggers registered for this trigger name ' + triggerAction);
        return this;
    }
    //Register current action callbacks to BeDOMNode for trigger
    targetBeDOMNode.addDomEventListenerContext(
        new ListenerContext(targetTrigger, {}, triggerArguments,
            currentBeDOMNode, _.clone(this.registeredActionCallbacks)));
    console.log('=> Registered ' + this.registeredActionCallbacks.length + ' actionCallback(s) for BeDOMNode "'
        + currentBeDOMNode.targetTagId + '", for trigger "'
        + triggerAction + '" on target BeDOMNode "' + targetBeDOMNode.targetTagId + '"');
};

var addActionCallback = function(actionCallback) {
    var newActionCallbacks = _.clone(this.registeredActionCallbacks);
    newActionCallbacks.push(actionCallback);
    return this.copy({registeredActionCallbacks: newActionCallbacks});
};

/*** Public methods ***/

ThisTag.prototype.copy = function(source) {
    var newTag = new ThisTag(this.executionContext);
    _.assign(newTag, this);
    _.assign(newTag, source);
    return newTag;
};

ThisTag.prototype.clear = function() {
    return this.copy({registeredActionCallbacks: []});
};

ThisTag.prototype.forBeDOMNode = function(beDOMNode) {
    return _.assign(this.clear(), {currentBeDOMNode: beDOMNode});
};

ThisTag.prototype.do = function(actionName, actionArgs) {
    var transFunctors = this.executionContext.transFunctors.getTransFunctorsByNameForArgs(actionName, actionArgs || []);
    if (_.isObject(transFunctors)) {
        return _.bind(addActionCallback, this)({ transFunctors: transFunctors });
    }
    return this;
};

ThisTag.prototype.whenIt = function(triggerName, triggerArgs) {
    _.bind(whenEventOccurs, this)(this.currentBeDOMNode, triggerName, triggerArgs || [], this.currentBeDOMNode);
    return this.clear();
};

ThisTag.prototype.whenTheTag = function(targetTagId, triggerName, triggerArgs) {
    var targetBeDOMNode = this.executionContext.findBeDOMNodeByTargetTagId(targetTagId);
    if (_.isUndefined(targetBeDOMNode)) {
        //TODO handle DOMNode by itself, without having to transform it into a beDOMNode
        console.error('Could not find target beDOMNode of id ' + targetTagId);
        return this;
    }
    _.bind(whenEventOccurs, this)(this.currentBeDOMNode, triggerName, triggerArgs || [], targetBeDOMNode);
    return this.clear();
};

ThisTag.prototype.whenDataSourceField = function(dataSourceFieldArgs, triggerName, triggerArgs) {
    var dataSourceName = dataSourceFieldArgs[0];
    if (!_.isString(dataSourceName)) {
        console.error('DataSourceName required as first argument');
        return this;
    }
    var fieldName = dataSourceFieldArgs[1];
    if (!_.isString(fieldName)) {
        console.error('FieldName required as first argument');
        return this;
    }
    var triggerAction = triggerName;
    var triggerArguments = triggerArgs || [];
    var targetTrigger = this.executionContext.triggers.getTriggerByName(triggerAction);
    if (_.isUndefined(targetTrigger)) {
        console.error('No triggers registered for this trigger name ' + triggerAction);
        return this;
    }
    //Register current action callbacks to BeDOMNode for dataSource listener
    this.currentBeDOMNode.addDataSourceListenerContext(
        new ListenerContext(targetTrigger, {dataSourceName: dataSourceName, fieldName: fieldName },
            triggerArguments, this.currentBeDOMNode, _.clone(this.registeredActionCallbacks)));
    console.log('=> Registered ' + this.registeredActionCallbacks.length + ' callback(s) for BeDOMNode "'
        + this.currentBeDOMNode.targetTagId + '", for dataSource "'
        + dataSourceName + '" and field "' + fieldName + '"');

    return this.clear();
};

ThisTag.prototype.andRevertOtherwise = function() {
    //TODO register functor to revert to original hnode + register opposite event listener which triggers that functor
    return this;
};

module.exports = ThisTag;
