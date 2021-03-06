var registeredTransFunctors = {};

var identityTransFunctor = function(name) {
    return {
        name: name || 'IDENTITY',
        transFunction: function(source, beDOMNode) {
            return beDOMNode;
        }
    };
};

var composeTransFunctors = function() {
    return _.reduce(_.flatten(arguments), function(composedTransFunctors, transFunctor) {
            return {
                name: transFunctor.name,
                transFunction: function(source, beDOMNode) {
                    return transFunctor.transFunction(source,
                        composedTransFunctors.transFunction(source, beDOMNode));
                }
            };
        }, identityTransFunctor());
};

var addTransFunctor = function(transFunctor) {
    //TODO why adding this line below breaks the actionArgs on bound function?
    // Should probably have a different fn which uses $.bind()
    /*registeredTransFunctors[transFunctor.name] = composeTransFunctors(
            registeredTransFunctors[transFunctor.name] || identityTransFunctor(transFunctor.name), transFunctor);*/
    registeredTransFunctors[transFunctor.name] = transFunctor;
    return registeredTransFunctors[transFunctor.name];
};

var addTransFunctors = function(transFunctors) {
    if (!_.isArray(transFunctors)) {
        transFunctors = [transFunctors];
    }
    _.each(transFunctors, addTransFunctor);
};

var getTransFunctorsByNameForArgs = function(name, actionArgs) {
    var registeredTransFunctor = registeredTransFunctors[name];
    if (_.isUndefined(registeredTransFunctor)) {
        console.error('No transFunctors registered for this action name ' + name);
        return;
    }
    return {
        name: name,
        transFunction: _.bind(registeredTransFunctor.transFunction, { name: name, actionArgs: actionArgs }),
        composeTransFunctors: composeTransFunctors
    };
};

module.exports = {
    addTransFunctors: addTransFunctors,
    getTransFunctorsByNameForArgs: getTransFunctorsByNameForArgs
};