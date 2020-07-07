const text = op.inStringEditor("text", "1,2,3"),
    separator = op.inString("separator", ","),
    toNumber = op.inValueBool("Numbers", true),
    parsed = op.outTrigger("Parsed"),
    arr = op.outArray("array"),
    len = op.outValue("length");

text.onChange = separator.onChange = toNumber.onChange = parse;

parse();

function parse()
{
    if (!text.get())
    {
        arr.set(null);
        arr.set([]);
        len.set(0);
        return;
    }

    const r = text.get().split(separator.get());

    if (r[r.length - 1] === "") r.length -= 1;

    len.set(r.length);

    op.setUiError("notnum", null);
    if (toNumber.get())
    {
        let hasStrings = false;
        for (let i = 0; i < r.length; i++)
        {
            r[i] = Number(r[i]);
            if (!CABLES.UTILS.isNumeric(r[i]))
            {
                hasStrings = true;
            }
        }
        if (hasStrings)
        {
            op.setUiError("notnum", "Parse Error / Not all values numerical!");
        }
    }

    arr.set(null);
    arr.set(r);
    parsed.trigger();
}
