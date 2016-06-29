//Initialise the dataSources
var dataSources = require('./dataSources.js');

//Register the triggers
var triggers = require('./triggers/triggers.js');
triggers.addTriggers(require('./triggers/domEventTriggers.js'));
triggers.addTriggers(require('./triggers/isEmpty.js'));
triggers.addTriggers(require('./triggers/isNotEmpty.js'));
triggers.addTriggers(require('./triggers/isLongerThan.js'));

//Register the transFunctors
var transFunctors = require('./transFunctors/transFunctors.js');
transFunctors.addTransFunctors(require('./transFunctors/applyStyle.js'));
transFunctors.addTransFunctors(require('./transFunctors/cssClasses.js'));
transFunctors.addTransFunctors(require('./transFunctors/captureValueFor.js'));
transFunctors.addTransFunctors(require('./transFunctors/refreshValue.js'));

//Create the executionContext
var executionContext = {
    dataSources: dataSources,
    triggers: triggers,
    transFunctors: transFunctors
};

//Parse the page to get all the BeDOM nodes
var beDOMNodes = require('./parser.js').parse();

//Execute the BeDOM nodes' scripts
require('./executor.js').execute(executionContext, beDOMNodes);
