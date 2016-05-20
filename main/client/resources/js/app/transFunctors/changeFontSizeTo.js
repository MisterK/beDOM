var VNode = require('virtual-dom/vnode/vnode');

module.exports = {
    name: 'CHANGE_FONT_SIZE_TO',
    transFunction: function(source, beDOMNode) {
        var targetSize = (this.actionArgs || [])[0];
        if (!_.isString(targetSize)) {
            console.error('Size required as first argument');
        }
        console.log('==> executing transFunctor: ' + this.name + ', targetSize: ' + targetSize);

        //TODO extract and change this shit
        var newHScript = _.cloneDeep(beDOMNode.hscript);
        newHScript.__proto__ = VNode.prototype;

        if (!newHScript.properties.style) {
            newHScript.properties.style = {};
        }
        newHScript.properties.style['font-size'] = targetSize;

        return beDOMNode.cloneWithNewHScript(newHScript);
    }
};