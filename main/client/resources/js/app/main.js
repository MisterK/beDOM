//Initialise the dataSources
var dataSources = require('./dataSources.js');

//Register the triggers
var triggers = require('./triggers.js');
triggers.addTriggers(require('./triggers/domEventTriggers.js'));
triggers.addTriggers(require('./triggers/isEmpty.js'));
triggers.addTriggers(require('./triggers/isNotEmpty.js'));
triggers.addTriggers(require('./triggers/isLongerThan.js'));

//Register the transFunctors
var transFunctors = require('./transFunctors.js');
transFunctors.addTransFunctor(require('./transFunctors/captureValueFor.js'));
transFunctors.addTransFunctor(require('./transFunctors/refreshValue.js'));
transFunctors.addTransFunctor(require('./transFunctors/changeColorTo.js'));
transFunctors.addTransFunctor(require('./transFunctors/changeBgColorTo.js'));
transFunctors.addTransFunctor(require('./transFunctors/changeFontSizeTo.js'));

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
