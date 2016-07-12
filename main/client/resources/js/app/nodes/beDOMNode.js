var VNode = require('virtual-dom/vnode/vnode');

var beDOMNode = function(targetTagId, targetDOMNode, hscript, commands) {
    this.targetTagId = targetTagId;
    this.targetDOMNode = targetDOMNode;
    this.hscript = hscript;
    this.commands = commands;
    this.domEventTriggerContexts = [];
    this.dataSourceListenerContexts = [];
    this.dataChanges = [];
};

// Binding phase methods => immutable

beDOMNode.prototype.appendCommands = function(commands) {
    var newNode = this.clone();
    newNode.commands += " \n" + commands;
    return newNode;
};

beDOMNode.prototype.updateHScript = function(hscript) {
    var newNode = this.clone();
    newNode.hscript = hscript;
    return newNode;
};

beDOMNode.prototype.addDataChange = function(dataChange) {
    var newNode = this.clone();
    var newDataChanges = _.clone(this.dataChanges);
    newDataChanges.push(dataChange);
    newNode.dataChanges = newDataChanges;
    return newNode;
};

beDOMNode.prototype.clone = function() {
    var newNode = new beDOMNode(this.targetTagId, this.targetDOMNode, this.hscript, this.commands);
    _.assign(newNode, this);
    return newNode;
};

beDOMNode.prototype.cloneHScript = function() {
    var newHScript = new VNode();
    _.assign(newHScript, _.cloneDeep(this.hscript));
    return newHScript;
};

//Execution phase methods, mutable

beDOMNode.prototype.clear = function(hscript) {
    this.hscript = hscript;
    this.dataChanges.length = 0;
};

module.exports = beDOMNode;