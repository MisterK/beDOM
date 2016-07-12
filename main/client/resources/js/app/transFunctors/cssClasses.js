var addClass = function(nodeClasses, className) {
    if (!_.contains(nodeClasses, className)) {
        nodeClasses.push(className); //TODO Minor: immutable push instead
    }
    return nodeClasses;
};
var removeClass = function(nodeClasses, className) {
    return _.filter(nodeClasses, function(nodeClass) { return nodeClass != className; });
};
var toggleClass = function(nodeClasses, className) {
    var newNodeClasses = removeClass(nodeClasses, className);
    if (newNodeClasses.length == nodeClasses.length) {
        newNodeClasses.push(className);
    }
    return newNodeClasses;
};
var isValidCssClass = function(cssClass) { return cssClass.length > 0; };

var classTransfunctor = function(transFunctorName, transFunction) {
    return {
        name: transFunctorName,
        transFunction: function(source, beDOMNode) {
            var actionArgs = (this.actionArgs || []);
            if (_.filter(actionArgs, function(className) { return !_.isString(className); }).length > 0) {
                console.error('CSS class names required as arguments');
                return beDOMNode;
            }
            console.log('      ==> executing transFunctor: "' + this.name
                + '", targetClasses: ["' + actionArgs.join('", "') + '"]');

            var newHScript = beDOMNode.cloneHScript();
            var newClassNames = _.reduce(actionArgs, transFunction,
                (newHScript.properties.className || '').split(' '));
            newHScript.properties.className = _.filter(newClassNames, isValidCssClass).join(' ');

            return beDOMNode.updateHScript(newHScript);
        }
    };
};

module.exports = [classTransfunctor('ADD_CLASS', addClass),
    classTransfunctor('REMOVE_CLASS', removeClass),
    classTransfunctor('TOGGLE_CLASS', toggleClass)];