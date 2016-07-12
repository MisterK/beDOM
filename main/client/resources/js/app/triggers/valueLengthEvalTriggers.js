var Trigger = require('./trigger.js');

var validateTriggertriggerArguments = function(triggerName, triggerArguments) {
    if (!_.isNumber(triggerArguments[0])) {
        console.error(triggerName + ' needs a number (length) as first argument');
        return false;
    }
};

var sanitizeValue = function(value) {
    return $.trim(value);
};
var isValueLongerThan = function(value, length) {
    return sanitizeValue(value).length > length;
};
var isValueShorterThan = function(value, length) {
    return sanitizeValue(value).length < length;
};
var isValueOfSameLength = function(value, length) {
    return sanitizeValue(value).length == length;
};
var isValueLongerOrSameLengthThan = function(value, length) {
    return isValueOfSameLength(value, length) || isValueLongerThan(value, length);
};
var isValueShorterOrSameLengthThan = function(value, length) {
    return isValueOfSameLength(value, length) || isValueShorterThan(value, length);
};

var fromTriggerArguments = function(triggerName, triggerArguments) {
    validateTriggertriggerArguments(triggerName, triggerArguments);
    return triggerArguments[0];
};

var forLength = function(length) {
    return function() {
        return length;
    };
};

var valueLengthEvalTrigger = function(triggerName, evalFunction, lengthReader) {
    return new Trigger(triggerName, 'change',
        function(domElement, triggerArguments) {
            return evalFunction(domElement.val(), lengthReader(triggerName, triggerArguments));
        },
        function(newValue, triggerArguments) {
            return evalFunction(newValue, lengthReader(triggerName, triggerArguments));
        });
};

module.exports = [valueLengthEvalTrigger('IS_LONGER_THAN', isValueLongerThan, fromTriggerArguments),
    valueLengthEvalTrigger('IS_SHORTER_THAN', isValueShorterThan, fromTriggerArguments),
    valueLengthEvalTrigger('IS_OF_LENGTH', isValueOfSameLength, fromTriggerArguments),
    valueLengthEvalTrigger('IS_LONGER_OR_OF_LENGTH', isValueLongerOrSameLengthThan, fromTriggerArguments),
    valueLengthEvalTrigger('IS_SHORTER_OR_OF_LENGTH', isValueShorterOrSameLengthThan, fromTriggerArguments),
    valueLengthEvalTrigger('IS_EMPTY', isValueOfSameLength, forLength(0)),
    valueLengthEvalTrigger('IS_NOT_EMPTY', isValueLongerThan, forLength(0))
];