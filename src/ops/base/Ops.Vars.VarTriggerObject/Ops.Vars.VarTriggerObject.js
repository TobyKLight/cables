const
    trigger = op.inTriggerButton("Trigger"),
    val = op.inObject("Value", null),
    next = op.outTrigger("Next");

op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "object", val, op.varName, trigger, next);
