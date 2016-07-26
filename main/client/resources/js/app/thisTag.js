var domEventListener = require('./listeners/domEventListener.js');
var dataSourceEventListener = require('./listeners/dataSourceEventListener.js');
var ListenerContext = require('./listeners/listenerContext.js');

var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var ThisTag = function(executionContext) {
    this.executionContext = executionContext;
    this.registeredActionCallbacks = [];
    this.currentBeDOMNode = undefined;
};

/*** Bindable private methods ***/

var applyTransformation = function(transformation) {
    //Calculate resulting diffs between original hscript and resulting hscript
    var patches = diff(transformation.targetBeDOMNode.hscript, transformation.resultingHScript);
    if (_.isObject(patches[0])) {
        console.log('=> DOM patches to be applied on BeDOMNode "'
            + transformation.targetBeDOMNode.targetTagId + '"');
    } else {
        console.log('=> **No** DOM patches to be applied on BeDOMNode "'
            + transformation.targetBeDOMNode.targetTagId + '"');
    }

    //TODO Later: Part with side-effect, move this to Monet.IO
    //Apply changes to DOM
    patch(transformation.targetBeDOMNode.targetDOMNode[0], patches);
    //Clean (Mutate) original node, as it's the new cycle
    transformation.targetBeDOMNode.clear(transformation.resultingHScript);
    //Persist data changes
    this.executionContext.dataSources.persistDataChanges(transformation.dataChanges);
};

var bindEventOnBeDOMNode = function(event) {
    _(domEventListener.getTransformationsForDOMEvent(event))
        .each(_.bind(applyTransformation, this));
};

var registerListenerOnDataSourceField = function(dataSourceName, fieldName, newValue, oldValue) {
    _.bind(applyTransformation, this)(
        dataSourceEventListener.getTransformationsForDataSourceEvent(
            this.executionContext, this.currentBeDOMNode, dataSourceName, fieldName, newValue, oldValue));
};

var whenEventOccurs = function(triggerAction, triggerArguments, targetBeDOMNode) {
    var targetTrigger = this.executionContext.triggers.getTriggerByName(triggerAction);
    if (_.isUndefined(targetTrigger)) {
        console.error('No triggers registered for this trigger name ' + triggerAction);
        return this;
    }
    //If event has never been bound before for current node
    if (_.isUndefined(_.find(targetBeDOMNode.domEventTriggerContexts, function(triggerContext) {
            return triggerContext.trigger.triggerEventName == targetTrigger.triggerEventName;
        }))) {
        //Bind listener function to current node
        targetBeDOMNode.targetDOMNode.on(targetTrigger.triggerEventName, targetBeDOMNode,
            _.bind(bindEventOnBeDOMNode, this));
        console.log('=> Bound event "' + targetTrigger.triggerEventName
            + '" on target BeDOMNode "' + targetBeDOMNode.targetTagId + '"');
    }
    //Register current action callbacks to BeDOMNode for trigger
    //TODO do not mutate node, return new one, to replace in this.executionContext.beDOMNodes[]
    targetBeDOMNode.domEventTriggerContexts.push(
        new ListenerContext(
            targetTrigger, {}, triggerArguments, this.currentBeDOMNode, _.clone(this.registeredActionCallbacks)));
    console.log('=> Registered ' + this.registeredActionCallbacks.length + ' actionCallbacks for BeDOMNode "'
        + this.currentBeDOMNode.targetTagId + '", for trigger "'
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
    _.bind(whenEventOccurs, this)(triggerName, triggerArgs || [], this.currentBeDOMNode);
    return this.clear();
};

ThisTag.prototype.whenTheTag = function(targetTagId, triggerName, triggerArgs) {
    var targetBeDOMNode = _.find(this.executionContext.beDOMNodes, function(beDOMNode) {
        return beDOMNode.targetTagId == targetTagId;
    });
    if (_.isUndefined(targetBeDOMNode)) {
        //TODO handle DOMNode by itself, without having to transform it into a beDOMNode
        console.error('Could not find target beDOMNode of id ' + targetTagId);
        return this;
    }
    _.bind(whenEventOccurs, this)(triggerName, triggerArgs || [], targetBeDOMNode);
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
    //If listener has never been registered on dataSource for field before for current node
    if (_.isUndefined(_.find(this.currentBeDOMNode.dataSourceListenerContexts,
            function(dataSourceListenerContext) {
                return dataSourceListenerContext.triggerContext.dataSourceName == dataSourceName
                    && dataSourceListenerContext.triggerContext.fieldName == fieldName;
            }))) {
        //Bind listener function to current node
        this.executionContext.dataSources.getDataSource(dataSourceName)
            .registerFieldListener(fieldName, _.bind(registerListenerOnDataSourceField, this));
        console.log('=> Registered listener on dataSource "'
            + dataSourceName + '" and field "' + fieldName + '"');
    }
    //Register current action callbacks to BeDOMNode for dataSource listener
    //TODO do not mutate node, return new one, to replace in this.executionContext.beDOMNodes[]
    this.currentBeDOMNode.dataSourceListenerContexts.push(
        new ListenerContext(targetTrigger,
            { dataSourceName: dataSourceName, fieldName: fieldName },
            triggerArguments, this.currentBeDOMNode, _.clone(this.registeredActionCallbacks)));
    console.log('=> Registered ' + this.registeredActionCallbacks.length + ' callbacks for BeDOMNode "'
        + this.currentBeDOMNode.targetTagId + '", for dataSource "'
        + dataSourceName + '" and field "' + fieldName + '"');

    return this.clear();
};

ThisTag.prototype.andRevertOtherwise = function() {
    //TODO register functor to revert to original hnode + register opposite event listener which triggers that functor
    return this;
};

module.exports = ThisTag;
