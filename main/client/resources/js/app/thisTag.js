module.exports = function(beDOMElement) {
    return {
        do: function() {
            //TODO check has functors for action
            //TODO register callback fn into this
            return this;
        },
        when: function() {
            //TODO register event listener, triggering callback fns registered in do()
            return this;
        },
        andRevertOtherwise: function() {
            //TODO register functor to revert to original hnode + register opposite event listener which triggers that functor
            return this;
        },
        captureValueFor: function() {
            //TODO register capture value into stor functor + register event listener on tag which triggers that functor
            return this;
        },
        displayValueFrom: function() {
            //TODO register display functor + register event listener on datasource which triggers that functor
            return this;
        }
    };
};