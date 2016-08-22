var VNode = require('virtual-dom/vnode/vnode');

var BeDOMNode = function(targetTagId, targetDOMNode, hscript, commands) {
    this.targetTagId = targetTagId;
    this.targetDOMNode = targetDOMNode;
    this.hscript = hscript;
    this.commands = commands;
    this.domEventListenerContexts = [];
    this.dataSourceListenerContexts = [];
    this.dataChanges = [];
};

// Binding phase methods => immutable
BeDOMNode.prototype.copy = function(source) {
    var newBeDOMNode = new BeDOMNode(this.targetTagId, this.targetDOMNode, this.hscript, this.commands);
    _.assign(newBeDOMNode, this);
    _.assign(newBeDOMNode, source);
    return newBeDOMNode;
};

BeDOMNode.prototype.appendCommands = function(commands) {
    return this.copy({commands: this.commands +" \n" + commands});
};

BeDOMNode.prototype.updateHScript = function(hscript) {
    return this.copy({hscript: hscript});
};

BeDOMNode.prototype.addDataChange = function(dataChange) {
    var newDataChanges = _.clone(this.dataChanges);
    newDataChanges.push(dataChange);
    return this.copy({dataChanges: newDataChanges});
};

BeDOMNode.prototype.cloneHScript = function() {
    var newHScript = new VNode();
    _.assign(newHScript, _.cloneDeep(this.hscript));
    return newHScript;
};

//Execution phase methods, mutable
BeDOMNode.prototype.addDomEventListenerContext = function(domEventListenerContext) { //TODO make immutable?
    this.domEventListenerContexts.push(domEventListenerContext);
};

BeDOMNode.prototype.addDataSourceListenerContext = function(dataSourceListenerContext) { //TODO make immutable?
    this.dataSourceListenerContexts.push(dataSourceListenerContext);
};

BeDOMNode.prototype.clear = function(hscript) {
    this.hscript = hscript;
    this.dataChanges.length = 0;
};

module.exports = BeDOMNode;