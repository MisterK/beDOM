var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var applyTransformations = function(executionContext, transformations) {
    //Calculate resulting diffs between original hscript and resulting hscript
    var patches = diff(transformations.targetBeDOMNode.hscript, transformations.resultingHScript);
    if (_.isObject(patches[0])) {
        console.log('=> ' + _.keys(patches).length + ' DOM patches to be applied on BeDOMNode "'
            + transformations.targetBeDOMNode.targetTagId + '"');
    } else {
        console.log('=> **No** DOM patches to be applied on BeDOMNode "'
            + transformations.targetBeDOMNode.targetTagId + '"');
    }

    //TODO Later: Part with side-effect, move this to Monet.IO
    //Apply changes to DOM
    patch(transformations.targetBeDOMNode.targetDOMNode[0], patches);
    //Clean (Mutate) original node, as it's the new cycle
    transformations.targetBeDOMNode.clear(transformations.resultingHScript);
    //Persist data changes
    if (transformations.dataChanges.length > 0) {
        console.log('=> ' + transformations.dataChanges.length + ' dataChange(s) to be applied for BeDOMNode "'
            + transformations.targetBeDOMNode.targetTagId + '"');
    } else {
        console.log('=> **No** dataChange(s) to be applied for BeDOMNode "'
            + transformations.targetBeDOMNode.targetTagId + '"');
    }
    executionContext.dataSources.persistDataChanges(transformations.dataChanges);
};

module.exports = {
    applyTransformations: applyTransformations
};