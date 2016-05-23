module.exports = {
    name: 'CHANGE_FONT_SIZE_TO',
    transFunction: function(source, beDOMNode) {
        var targetSize = (this.actionArgs || [])[0];
        if (!_.isString(targetSize)) {
            console.error('Size required as first argument');
        }
        console.log('    ==> executing transFunctor: "' + this.name + '", targetSize: "' + targetSize + '"');

        var newHScript = beDOMNode.cloneHScript();
        if (!newHScript.properties.style) {
            newHScript.properties.style = {};
        }
        newHScript.properties.style['font-size'] = targetSize;

        return beDOMNode.cloneWithNewHScript(newHScript);
    }
};