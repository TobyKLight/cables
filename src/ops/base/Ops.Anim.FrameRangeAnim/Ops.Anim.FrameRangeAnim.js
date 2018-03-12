var inTime=op.inValue("Time");
var inStr=op.inValueString("Frames");
var inLoop=op.inValueBool("Loop");
var inRewind=op.inFunctionButton("Rewind");
var outValue=op.outValue("result time");
var outArr=op.outArray("Expanded Frames");
var finished=op.outValue("Finished",false);
var finishedTrigger=op.outFunction("Finished Trigger");

var anim=new CABLES.Anim();
var FPS=30;

var timeOffset=0;
inStr.onChange=
inLoop.onChange=parse;

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

inRewind.onTriggered=function()
{
    timeOffset=inTime.get();
};

function setupAnim(frames)
{
    anim.clear();
    anim.loop=inLoop.get();

    for(var i=0;i<frames.length;i++)
    {
        anim.defaultEasing=CABLES.ANIM.EASING_ABSOLUTE;
        if(i<frames.length-1)
        {
            if(frames[i+1]==frames[i]+1 || frames[i+1]==frames[i]-1)
                anim.defaultEasing=CABLES.ANIM.EASING_LINEAR;
        }

        anim.setValue(i/FPS,frames[i]/FPS);
    }
}

function parse()
{
    var str=inStr.get();
    var frames=[];
    var parts=str.split(',');
    
    for(var i=0;i<parts.length;i++)
    {
        if(isNumeric(parts[i]))
        {
            frames.push(parseInt(parts[i],10));
        }
        else if(parts[i].indexOf('-')>-1)
        {
            var r=parts[i].split('-');
            r[0]=parseInt(r[0],10);
            r[1]=parseInt(r[1],10);

            for(var j=Math.min(r[0],r[1]);j<=Math.max(r[0],r[1]);j++)
            {
                frames.push(j);
            }
        }
    }
    
    outArr.set(null);
    outArr.set(frames);
    setupAnim(frames);
}

inTime.onChange=function()
{
    var t=inTime.get()-timeOffset;
    outValue.set(anim.getValue(t));
    
    if(anim.hasEnded(t))
    {
        if(!finished.get()) finishedTrigger.trigger();
        finished.set(true);
    }
    else
    {
        finished.set(false);
    }

};