module.exports = {
    name: 'DISPLAY_VALUE_FROM',
    transFunction: function(source, beDOMNode) {
        var actionArgs = (this.actionArgs || []);
        var newValue = actionArgs[0];
        if (_.isUndefined(newValue)) {
            console.error('newValue required as first argument');
        }
        var oldValue = actionArgs[1];
        if (!_.isString(oldValue)) {
            console.error('oldValue required as second argument');
        }
        console.log('    ==> executing transFunctor: "' + this.name
            + '", dataSourceName: "' + newValue + '", oldValue: "' + oldValue + '"');

        var newHScript = beDOMNode.cloneHScript();
        if (newHScript.children.length == 0) {
            newHScript.children.push({text: newValue});
        } else {
            newHScript.children[0].text = newValue;
        }

        return beDOMNode.cloneWithNewHScript(newHScript);
    }
};