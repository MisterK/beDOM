//Initialise the dataSources
var dataSources = require('./dataSources.js');

//Register the triggers
var triggers = require('./triggers/triggers.js');
triggers.addTriggers(require('./triggers/domEventTriggers.js'));
triggers.addTriggers(require('./triggers/valueLengthEvalTriggers.js'));

//Register the transFunctors
var transFunctors = require('./transFunctors/transFunctors.js');
transFunctors.addTransFunctors(require('./transFunctors/applyStyle.js'));
transFunctors.addTransFunctors(require('./transFunctors/cssClasses.js'));
transFunctors.addTransFunctors(require('./transFunctors/captureValueFor.js'));
transFunctors.addTransFunctors(require('./transFunctors/refreshValue.js'));

//Create the executionContext
var ExecutionContext = require('./executionContext.js');
var executionContext = new ExecutionContext(dataSources, triggers, transFunctors);

//Parse the page to get all the BeDOM nodes
executionContext.beDOMNodes = require('./parser.js').parse();

//Execute the BeDOM nodes' scripts, to bind behaviours to events
executionContext = require('./binders/listenerContextsBinder.js').bindListenerContexts(executionContext);
executionContext = require('./binders/domEventBinder.js').bindListenersToDOMEvents(executionContext);
executionContext = require('./binders/dataSourceEventBinder.js').bindListenersToDataSourceField(executionContext);
