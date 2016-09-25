op.name='random cluster';

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var num=op.addInPort(new Port(op,"num"));
var size=op.addInPort(new Port(op,"size"));
var seed=op.addInPort(new Port(op,"random seed"));
var scaleX=op.addInPort(new Port(op,"scaleX",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleY=op.addInPort(new Port(op,"scaleY",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleZ=op.addInPort(new Port(op,"scaleZ",OP_PORT_TYPE_VALUE,{ display:'range' }));
var round=op.inValueBool('round',false);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION)) ;
var idx=op.addOutPort(new Port(op,"index")) ;
var rnd=op.addOutPort(new Port(op,"rnd")) ;

var cgl=op.patch.cgl;
var randoms=[];
var randomsRot=[];
var randomsFloats=[];

scaleX.set(1);
scaleY.set(1);
scaleZ.set(1);

var transVec=vec3.create();
var mat=mat4.create();

function doRender()
{
    for(var i=0;i<randoms.length;i++)
    {
        cgl.pushMvMatrix();

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, randoms[i]);

        mat4.rotateX(cgl.mvMatrix,cgl.mvMatrix, randomsRot[i][0]);
        mat4.rotateY(cgl.mvMatrix,cgl.mvMatrix, randomsRot[i][1]);
        mat4.rotateZ(cgl.mvMatrix,cgl.mvMatrix, randomsRot[i][2]);
        // mat4.fromRotationTranslation(mat, randomsRot[i], randoms[i]);
        // mat4.multiply(cgl.mvMatrix, cgl.mvMatrix, mat);

        idx.set(i);
        rnd.set(randomsFloats[i]);

        trigger.trigger();

        cgl.popMvMatrix();
    }
}

exe.onTriggered=doRender;

function getRandomPos()
{
    return vec3.fromValues(
        scaleX.get()*(Math.seededRandom()-0.5)*size.get(),
        scaleY.get()*(Math.seededRandom()-0.5)*size.get(),
        scaleZ.get()*(Math.seededRandom()-0.5)*size.get()
        );
}


function reset()
{
    randoms.length=0;
    randomsRot.length=0;
    randomsFloats.length=0;

    Math.randomSeed=seed.get();
    
    var makeRound=round.get();

    for(var i=0;i<num.get();i++)
    {
        randomsFloats.push(Math.seededRandom());

        var v=getRandomPos();
        
        if(makeRound)
            while(vec3.len(v)>size.get()/2)
                v=getRandomPos();

        randoms.push(v);

        randomsRot.push(vec3.fromValues(
            Math.seededRandom()*360*CGL.DEG2RAD,
            Math.seededRandom()*360*CGL.DEG2RAD,
            Math.seededRandom()*360*CGL.DEG2RAD
            ));
    }
}

size.set(20);
seed.set(1);
seed.onChange=reset;
num.onChange=reset;
size.onChange=reset;
scaleX.onChange=reset;
scaleZ.onChange=reset;
scaleY.onChange=reset;
round.onChange=reset;

num.set(100);