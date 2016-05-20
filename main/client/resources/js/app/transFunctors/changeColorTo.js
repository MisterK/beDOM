var VNode = require('virtual-dom/vnode/vnode');

module.exports = {
    name: 'CHANGE_COLOR_TO',
    transFunction: function(source, beDOMNode) {
        var targetColor = (this.actionArgs || [])[0];
        if (!_.isString(targetColor)) {
            console.error('Color required as first argument');
        }
        console.log('==> executing transFunctor: ' + this.name + ', targetColor: ' + targetColor);

        //TODO extract and change this shit
        var newHScript = _.cloneDeep(beDOMNode.hscript);
        newHScript.__proto__ = VNode.prototype;

        console.log(newHScript);
        if (!newHScript.properties.style) {
            newHScript.properties.style = {};
        }
        newHScript.properties.style.color = targetColor;

        return beDOMNode.cloneWithNewHScript(newHScript);
    }
};