var registeredTransFunctors = {};

var identityTransFunctor = function(name) {
    return {
        name: name,
        transFunction: _.identity
    };
};

var composeTransFunctors = function() {
    return _.reduce(arguments, function(composedTransFunctors, transFunctor) {
            return {
                name: transFunctor.name,
                transFunction: function(actionArgs, beDOMNode) {
                    return transFunctor(actionArgs, composedTransFunctors(actionArgs, beDOMNode));
                }
            };
        }, identityTransFunctor());
};

var addTransFunctor = function(transFunctor) {
    registeredTransFunctors[transFunctor.name] = composeTransFunctors(
        getTransFunctorsByName(transFunctor.name) || identityTransFunctor(transFunctor.name), transFunctor);
    return registeredTransFunctors[transFunctor.name];
};

var getTransFunctorsByName = function(name) {
    return registeredTransFunctors[name];
};

module.exports = {
    addTransFunctor: addTransFunctor,
    getTransFunctorsByName: getTransFunctorsByName
};