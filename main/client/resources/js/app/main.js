var dataSources = require('./dataSources.js');
var formDataSource = dataSources.createDataSource('form'); //TODO Create on first binding

//Register the triggers
var triggers = require('./triggers.js');
triggers.addTrigger(require('./triggers/isEmpty.js'));
triggers.addTrigger(require('./triggers/isNotEmpty.js'));

//Register the transFunctors
var transFunctors = require('./transFunctors.js');
transFunctors.addTransFunctor(require('./transFunctors/changeColorTo.js'));

//Create the executionContext
var executionContext = {
    dataSources: dataSources,
    triggers: triggers,
    transFunctors: transFunctors
};

//Parse the page to get all the BeDOM nodes
var beDOMNodes = require('./parser.js').parse();
console.log("Found " + beDOMNodes.length + " beDOMNode(s)");

//Execute the BeDOM nodes' scripts
require('./executor.js').execute(executionContext, beDOMNodes);