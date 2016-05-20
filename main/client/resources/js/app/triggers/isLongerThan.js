module.exports = {
    name: 'IS_LONGER_THAN',
    bindingEvent: 'change',
    triggerFunction: function(domElement, triggerProperties) {
        if (!_.isNumber(triggerProperties[0])) {
            console.error('IS_LONGER_THAN needs a number as first argument');
            return false;
        }
        return $.trim(domElement.val()).length > triggerProperties[0];
    }
};