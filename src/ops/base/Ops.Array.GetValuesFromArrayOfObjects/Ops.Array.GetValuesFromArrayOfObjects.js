const
    inArr = op.inArray("Array"),
    inKey = op.inString("Key"),
    inignoreNonNums = op.inBool("Numbers Only", false),
    outArray = op.outArray("Result");

inKey.onChange = inArr.onChange = inignoreNonNums.onChange = exec;

function exec()
{
    const arr = inArr.get();

    if (!arr)
    {
        outArray.set(null);
        return;
    }

    const newArr = [];
    const key = inKey.get();
    const numsonly = inignoreNonNums.get();

    for (let i = 0; i < arr.length; i++)
    {
        const obj = arr[i];

        if (obj && obj.hasOwnProperty(key))
        {
            if (numsonly)
            {
                if (CABLES.UTILS.isNumeric(obj[key])) newArr.push(obj[key]);
            }
            else
            {
                newArr.push(obj[key]);
            }
        }
    }

    outArray.set(null);
    outArray.set(newArr);
}
