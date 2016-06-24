module.exports = {
    name: 'REFRESH_VALUE',
    transFunction: function(source, beDOMNode) {
        var actionArgs = (this.actionArgs || []);
        var newValue = actionArgs[0];
        if (_.isUndefined(newValue)) {
            console.error('newValue required as first argument');
            return beDOMNode;
        }
        var oldValue = actionArgs[1];
        if (!_.isString(oldValue)) {
            console.error('oldValue required as second argument');
            return beDOMNode;
        }
        console.log('    ==> executing transFunctor: "' + this.name
            + '", newValue: "' + newValue + '", oldValue: "' + oldValue + '"');

        //TODO Bug: This is not working, create VText instead?
        var newHScript = beDOMNode.cloneHScript();
        if (newHScript.children.length == 0) {
            newHScript.children.push({text: newValue});
        } else {
            newHScript.children[0].text = newValue;
        }

        return beDOMNode.updateHScript(newHScript);
    }
};