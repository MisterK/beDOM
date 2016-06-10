module.exports = {
    name: 'CHANGE_BGCOLOR_TO',
    transFunction: function(source, beDOMNode) {
        var targetColor = (this.actionArgs || [])[0];
        if (!_.isString(targetColor)) {
            console.error('Color required as first argument');
        }
        console.log('    ==> executing transFunctor: "' + this.name + '", targetColor: "' + targetColor + '"');

        var newHScript = beDOMNode.cloneHScript();
        if (!newHScript.properties.style) {
            newHScript.properties.style = {};
        }
        newHScript.properties.style['background-color'] = targetColor;

        return beDOMNode.updateHScript(newHScript);
    }
};