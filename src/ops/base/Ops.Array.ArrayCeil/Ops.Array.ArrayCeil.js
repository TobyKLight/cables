const inArray=op.inArray("In"),
    outArray=op.outArray("Result");

const newArr=[];
outArray.set(newArr);

inArray.onChange=function()
{
    var arr=inArray.get();

    if(!arr)
    {
        outArray.set(null);
        return;
    }
    if(newArr.length!=arr.length) newArr.length=arr.length;

    for(var i=0;i<arr.length;i++)
    {
        newArr[i] = Math.ceil(arr[i]);
    }
    outArray.set(null);
    outArray.set(newArr);
};
