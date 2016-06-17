== FEATURES ==
- Natural language, by setting dynamic methods on thisTag from list of transFunctors + triggers
    - same for 'ELEMENT' => theTag('id').<triggerName>()
- Add transFunctors:
    - Add class
    - Remove class
- Add more domEventTriggers => all dom events?
    -> Make addTransFunctors() accept an array
- Add converters (similar to Angular filtering directives)
    -> How-to for DISPLAY_VALUE?
- andRevertOtherwise()

== IMPROVEMENTS ==
- Move bindEventOnBeDOMNode and registerListenerOnDataSourceField to other module
- Make bindEventOnBeDOMNode and registerListenerOnDataSourceField return list of changes,
    and do IO in the execution (using Monet.IO?)
- Add clearWithNewHScript() on BeDOMNode
- Add dbListenerFn on some triggers (e.g. changes)
- Try to compact triggerContexts for same trigger and DBListeners for same field at the end of binding phase?
- Make DOM binding fn a singleton,
    which then delegates to registered triggerContexts -> group by targetBeDOMNode then compose, then execute
    -> isn't it that already?
- TransFunctors' source should be the original BeDOMNode, to compare with resulting one if necessary?
- contraMap() to transform/filter source?
- Handle reference to non-BeDOMNode, which can then become one
- Handle double-adding of transFunctor in addTransFunctor(), currently breaks fn binding to 'this' with actionArgs
- thisTag should be pure (map array of BeDOMNodes)
    => no more mutations on BeDOMNode's triggerContexts and dataSourceListenerContexts

== TODO ==
- Test more complex composition

== BUGS ==
- VText adding/update doesn't work
- captureValue should take value from hScript, not DOM, to respect converters