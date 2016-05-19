module.exports = {
    name: 'IS_NOT_EMPTY',
    bindingEvent: 'change',
    triggerFunction: function(domElement) {
        return $.trim(domElement.val()).length > 0;
    }
};