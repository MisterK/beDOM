module.exports = {
    name: 'APPLY_STYLE',
    transFunction: function(source, beDOMNode) {
        var targetStyle = (this.actionArgs || [])[0];
        if (!_.isObject(targetStyle)) {
            console.error('Style object required as first argument');
            return beDOMNode;
        }
        console.log('    ==> executing transFunctor: "' + this.name + '", targetStyle: "' + targetStyle + '"');

        var newHScript = beDOMNode.cloneHScript();
        if (!newHScript.properties.style) {
            newHScript.properties.style = {};
        }
        _.assign(newHScript.properties.style, targetStyle);

        return beDOMNode.updateHScript(newHScript);
    }
};