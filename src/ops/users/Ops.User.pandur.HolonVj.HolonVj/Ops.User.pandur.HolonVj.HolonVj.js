op.name="HolonVj";

var eventIn=op.addInPort(new Port(op,"Event Input",OP_PORT_TYPE_OBJECT));

var beatArray=op.addInPort(new Port(op,"Beat Array",OP_PORT_TYPE_ARRAY));

var noteBeat1=op.addInPort(new Port(op,"Note Beat 1"));
var learnBeat1=op.addInPort(new Port(op,"Learn Beat 1",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteBeat2=op.addInPort(new Port(op,"Note Beat 2"));
var learnBeat2=op.addInPort(new Port(op,"Learn Beat 2",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteBeat3=op.addInPort(new Port(op,"Note Beat 3"));
var learnBeat3=op.addInPort(new Port(op,"Learn Beat 3",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteBeat4=op.addInPort(new Port(op,"Note Beat 4"));
var learnBeat4=op.addInPort(new Port(op,"Learn Beat 4",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var eventOut=op.addOutPort(new Port(op,"Event Output",OP_PORT_TYPE_OBJECT));
var outScene=op.addOutPort(new Port(op,"Current Scene"));

var outEffects=op.addOutPort(new Port(op,"Current Effect",OP_PORT_TYPE_ARRAY));

var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));



var resetEffects=op.addInPort(new Port(op,"Reset Effects",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteEffectsStart=op.addInPort(new Port(op,"Note Effects Start"));
var learnEffectsStart=op.addInPort(new Port(op,"Learn Effects Start",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteEffectsEnd=op.addInPort(new Port(op,"Note Effects End"));
var learnEffectsEnd=op.addInPort(new Port(op,"Learn Effects End",OP_PORT_TYPE_FUNCTION,{display:'button'}));


var noteScenesStart=op.addInPort(new Port(op,"Note Scenes Start"));
var learnScenesStart=op.addInPort(new Port(op,"Learn Scenes Start",OP_PORT_TYPE_FUNCTION,{display:'button'}));

var noteScenesEnd=op.addInPort(new Port(op,"Note Scenes End"));
var learnScenesEnd=op.addInPort(new Port(op,"Learn Scenes End",OP_PORT_TYPE_FUNCTION,{display:'button'}));


outEffects.set(null);
noteBeat1.set(1);

var learningBeat1=false;
var learningBeat2=false;
var learningBeat3=false;
var learningBeat4=false;

var learningEffectStart=false;
var learningEffectEnd=false;

var learningScenesStart=false;
var learningScenesEnd=false;

learnBeat1.onTriggered=function(){learningBeat1=true;};
learnBeat2.onTriggered=function(){learningBeat2=true;};
learnBeat3.onTriggered=function(){learningBeat3=true;};
learnBeat4.onTriggered=function(){learningBeat4=true;};

learnEffectsStart.onTriggered=function(){learningEffectStart=true;};
learnEffectsEnd.onTriggered=function(){learningEffectEnd=true;};

learnScenesStart.onTriggered=function(){learningScenesStart=true;};
learnScenesEnd.onTriggered=function(){learningScenesEnd=true;};


var beatScenes=[0,0,0,0];
var beatNotes=[0,0,0,0];

var useBeat1=false;
var useBeat2=false;
var useBeat3=false;
var useBeat4=false;
var out=null;
var effects=[[],[],[],[]];

function convertToLaunchPad(which)
{
    var ret=0;
    if(which<8) return which;
    if(which<16) return which+8;
    if(which<24) return which+16;
    return ret;
}
function convertLaunchPad(which)
{
    var ret=0;
    if(which<8) ret=which;
    else if(which<24) ret=which-8;
    else if(which<40) ret=which-16;
    else if(which<56) ret=which-24;
    else if(which<72) ret=which-32;
    else if(which<88) ret=which-40;
    else if(which<104) ret=which-48;
    else if(which<120) ret=which-56;
    return ret;
}

function isSpecialButton(note)
{
    var ignore=false;
    if(note==8) ignore=true;
    if(note==24) ignore=true;
    if(note==40) ignore=true;
    if(note==56) ignore=true;
    if(note==72) ignore=true;
    if(note==88) ignore=true;
    if(note==104) ignore=true;
    if(note==120) ignore=true;
    
    return ignore;
}

resetEffects.onTriggered=function()
{
    effects=[[],[],[],[]];
};

function toggleEffectBeat(beat,effectNum)
{
    var found=false;
    for(var i=0;i<effects[beat].length;i++)
    {
        if(effects[beat][i]==effectNum)
        {
            console.log('found effect!');
            found=true;
            effects[beat].splice(i,1);
            break;
        }
    }
    if(!found) effects[beat].push(effectNum);
    
}

function setEffectBeat(beat,effectNum,val)
{
    var found=false;
    
    if(val==0)
    {
        for(var i=0;i<effects[beat].length;i++)
        {
            if(effects[beat][i]===effectNum)
            {
                effects[beat].splice(i,1);
            }
        }

    }
    else
    {
        
        var found=false;
        for(var i=0;i<effects[beat].length;i++)
        {
            if(effects[beat][i]===effectNum)
            {
                found=true;
                break;
            }
        }

        if(!found)effects[beat].push(effectNum);        
    }


}


function setEffect(note)
{
    if(isSpecialButton(note))return;
    
    var effectNum=convertLaunchPad(note-noteEffectsStart.get());

    console.log('effect'+effectNum);
    
    if(useBeat1) toggleEffectBeat(0,effectNum);
    else if(useBeat2) toggleEffectBeat(1,effectNum);
    else if(useBeat3) toggleEffectBeat(2,effectNum);
    else if(useBeat4) toggleEffectBeat(3,effectNum);
    else
    {
        var numExists=0;
        for(var beat=0;beat<effects.length;beat++)
            for(var i=0;i<effects[beat].length;i++)
                if(effects[beat][i]==effectNum) numExists++;
                
        var onOff=1;
        if(numExists>=4)onOff=0;


        console.log('onoff',onOff);
        
        setEffectBeat(0,effectNum,onOff);
        setEffectBeat(1,effectNum,onOff);
        setEffectBeat(2,effectNum,onOff);
        setEffectBeat(3,effectNum,onOff);
    }
    
}


function setScene(note)
{
    
    if(isSpecialButton(note))return;

    if(useBeat1) 
    {
        beatScenes[0]=convertLaunchPad(note);
        beatNotes[0]=note;
    }
    else if(useBeat2) 
    {
        beatScenes[1]=convertLaunchPad(note);
        beatNotes[1]=note;
    }
    else if(useBeat3) 
    {
        beatScenes[2]=convertLaunchPad(note);
        beatNotes[2]=note;
    }
    else if(useBeat4) 
    {
        beatScenes[3]=convertLaunchPad(note);
        beatNotes[3]=note;
    }
    else
    {
        beatNotes[0]=note;
        beatNotes[1]=note;
        beatNotes[2]=note;
        beatNotes[3]=note;
        beatScenes[0]=convertLaunchPad(note);
        beatScenes[1]=convertLaunchPad(note);
        beatScenes[2]=convertLaunchPad(note);
        beatScenes[3]=convertLaunchPad(note);
        // console.log('set all to ',note);
        
    }
};



var lightStates=[];


function setPixel(note,val)
{
    if(note>lightStates.length-1)
    {
        lightStates.length=note+100;
        for(var i=0;i<lightStates.length;i++)lightStates[i]=-1;
    }
    
    if(note<0)return;
    if(val==1)val=120;
    else if(val==2)val=127;
    else if(val==4)val=20;
    if(out) 
    {
        if(lightStates[note]!=val) out.send( [0x90, note, val] );
        lightStates[note]=val
    }
}


var lastNoteEffect=-1;

var clearLights=[];

beatArray.onValueChanged=function()
{
    var beats=beatArray.get();

    clearLights.length=Math.max(noteEffectsEnd.get(),noteScenesEnd.get());

    for(var k=noteEffectsStart.get();k<=noteEffectsEnd.get();k++)clearLights[k]=1;
    for(var k=noteScenesStart.get();k<=noteScenesEnd.get();k++)clearLights[k]=1;

    var currentBeat=0;

    if(beats)
    {
        for(var i=0;i<4;i++)
        {
            for(var j in effects[i])
            {
                clearLights[convertToLaunchPad(effects[i][j])+noteEffectsStart.get()]=0;
                setPixel(convertToLaunchPad(effects[i][j])+noteEffectsStart.get(),1);
            }
        }

        for(var i=0;i<4;i++)
        {
            setPixel(beatNotes[i],1);
            clearLights[beatNotes[i]]=0;
        }

        for(var i=0;i<4;i++)
        {
            
            if(beats[i]==1)
            {
                currentBeat=i;
                setPixel(beatNotes[i],3);
                clearLights[beatNotes[i]]=0;
                outScene.set(beatScenes[i]);
            }

            for(var j in effects[i])
            {
                if(beats[i]==1)
                {
                    setPixel(convertToLaunchPad(effects[i][j])+noteEffectsStart.get(),3);
                    clearLights[convertToLaunchPad(effects[i][j])+noteEffectsStart.get()]=0;
                }
            }
        }
        
        outEffects.set(null);
        outEffects.set(effects[currentBeat]);

    }

    for(var i=0;i<clearLights.length;i++)
    {
        if(clearLights[i]==1)setPixel(i,0);
    }



};


eventIn.onValueChanged=function()
{
    var event=eventIn.get();
    out=event.output;


    if(out)
    {
        out.send( [0x90, 8, 120] );
    }

    if(learningEffectStart)
    {
        noteEffectsStart.set(event.note);
        learningEffectStart=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }
    if(learningEffectEnd)
    {
        noteEffectsEnd.set(event.note);
        learningEffectEnd=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(learningScenesStart)
    {
        noteScenesStart.set(event.note);
        learningScenesStart=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }
    if(learningScenesEnd)
    {
        noteScenesEnd.set(event.note);
        learningScenesEnd=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(learningBeat1)
    {
        noteBeat1.set(event.note);
        learningBeat1=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(learningBeat2)
    {
        noteBeat2.set(event.note);
        learningBeat2=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(learningBeat3)
    {
        noteBeat3.set(event.note);
        learningBeat3=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(learningBeat4)
    {
        noteBeat4.set(event.note);
        learningBeat4=false;
        if(CABLES.UI) gui.patch().showOpParams(op);
    }

    if(noteBeat1.get()==event.note)
    {
        var v=event.velocity;
    
        if(v==1) useBeat1=true;
        else useBeat1=false;
    }

    if(noteBeat2.get()==event.note)
    {
        var v=event.velocity;
    
        if(v==1) useBeat2=true;
        else useBeat2=false;
    }

    if(noteBeat3.get()==event.note)
    {
        var v=event.velocity;
    
        if(v==1) useBeat3=true;
        else useBeat3=false;
    }

    if(noteBeat4.get()==event.note)
    {
        var v=event.velocity;
    
        if(v==1) useBeat4=true;
        else useBeat4=false;
    }

    if(event.note>=noteEffectsStart.get() && event.note<=noteEffectsEnd.get())
    {
        if(event.cmd==9)
            if(event.velocity>0) setEffect(event.note);
    }
    if(event.note>=noteScenesStart.get() && event.note<=noteScenesEnd.get())
    {
        if(event.cmd==9)
            if(event.velocity>0) setScene(event.note);
    }

    eventOut.set(event);
};

