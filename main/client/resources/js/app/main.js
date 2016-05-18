var dataSources = require('./dataSources.js');
var formDataSource = dataSources.createDataSource('form'); //TODO Create on first binding

//Parse the page to get all the BeDOM nodes
var beDOMNodes = require('./parser.js').parse();

//Execute the BeDOM nodes' scripts
require('./executor.js').execute(beDOMNodes);