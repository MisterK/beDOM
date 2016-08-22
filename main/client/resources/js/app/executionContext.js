var ExecutionContext = function(dataSources, triggers, transFunctors) {
    this.dataSources = dataSources;
    this.triggers = triggers;
    this.transFunctors = transFunctors;
    this.beDOMNodes = [];
};

var compareTargetTagId = function(targetTagId) {
    return function(beDOMNode) {
        return beDOMNode.targetTagId == targetTagId;
    }
};

ExecutionContext.prototype.findBeDOMNodeByTargetTagId = function(targetTagId) {
    return _.find(this.beDOMNodes, compareTargetTagId(targetTagId));
};

ExecutionContext.prototype.findBeDOMNodeIndexByTargetTagId = function(targetTagId) {
    return _.findIndex(this.beDOMNodes, compareTargetTagId(targetTagId));
};

module.exports = ExecutionContext;