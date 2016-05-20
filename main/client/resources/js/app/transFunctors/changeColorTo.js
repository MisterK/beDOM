module.exports = {
    name: 'CHANGE_COLOR_TO',
    transFunction: function(source, beDOMNode) {
        var actionArgs = this.actionArgs || [];
        console.log('actionArgs: ' + actionArgs[0]);
        return beDOMNode; //TODO
    }
};