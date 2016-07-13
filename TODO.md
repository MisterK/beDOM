== IN PROGRESS  ==

== FEATURES ==
- Natural language, by setting dynamic methods on thisTag from list of transFunctors + triggers
    - same for 'ELEMENT' => theTag('id').<triggerName>()
- Add more domEventTriggers => all dom events?
- Add converters (similar to Angular filtering directives)
    -> How-to for DISPLAY_VALUE?
- andRevertOtherwise()

== IMPROVEMENTS ==
- Encapsulate IO/Mutability in the execution (using Monet.IO?)
- Add clearWithNewHScript() on BeDOMNode
- Try to compact triggerContexts for same trigger and DBListeners for same field at the end of binding phase, rather than on event?
- TransFunctors' input should be hscript, and source should be the original BeDOMNode, to compare with resulting one if necessary?
    -> rename transFunctors into vdomFunctors
- contraMap() to transform/filter source?
- Handle reference to non-BeDOMNode, which can then become one
- thisTag should be pure (map array of BeDOMNodes)
    => no more mutations on BeDOMNode's domEventTriggerContexts and dataSourceListenerContexts
- forTag could be a CSS selector, potentially re-run on event triggering (-> transform found DOM elements to beDOMElements on the fly)
- When to refresh beDOMNode's hscript?
    re-evaluate when event occurs
    or listen to all events on dom?
    or let user choose ("managed" mode vs "non-managed")

== TODO ==
- Test more complex composition

== BUGS ==
- VText adding/update doesn't work
    - bug when value="something" on initial dom element
- captureValue should take value from hScript, not DOM, to respect converters