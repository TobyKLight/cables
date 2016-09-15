var cgl=op.patch.cgl;
op.name='WebVR';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var triggerGamePad=op.addOutPort(new Port(op,"Controller Matrix",OP_PORT_TYPE_FUNCTION));
var numGamepads=op.addOutPort(new Port(op,"Num Controller",OP_PORT_TYPE_VALUE));
var outPose=op.addOutPort(new Port(op,"Pose",OP_PORT_TYPE_OBJECT));
var eyeLeft=op.addOutPort(new Port(op,"Eye Info Left",OP_PORT_TYPE_OBJECT));
var eyeRight=op.addOutPort(new Port(op,"Eye Info Right",OP_PORT_TYPE_OBJECT));


var vrDisplay=null;

var orientMatrix=mat4.create();
var identMatrix=mat4.create();
var quaternion=[0,0,0,0];
var firstQuat=null;

// https://mozvr.com/webvr-spec/#interface-interface-vrfieldofview
// view-source:http://toji.github.io/webvr-samples/XX-vr-controllers.html

var gp1Matrix=mat4.create();
var qMat=mat4.create();
var frameData = null;


var hasDisplay=op.outValue('hasDisplay');
var hasPose=op.outValue('hasPose');
var hasOrientation=op.outValue('hasorientation');
var isPresenting=op.outValue('is presenting');



render.onTriggered=function()
{

    var pose=null;
    if(vrDisplay)
    {
        isPresenting.set(vrDisplay.isPresenting);
        hasDisplay.set(true);
        pose=vrDisplay.getPose();
        
        if(pose) hasPose.set(true);
            else hasPose.set(false);
        //vrDisplay.getFrameData(frameData);
        // outFrameData.set(frameData);
        eyeLeft.set(vrDisplay.getEyeParameters("left"));
        eyeRight.set(vrDisplay.getEyeParameters("right"));


        if(pose.orientation)
        {
            hasOrientation.set(true);
            outPose.set(pose);
            //mat4.multiply(cgl.vMatrix,cgl.vMatrix,poseMat);
        }else hasOrientation.set(false);
        trigger.trigger();
    }
    else
    {
        hasDisplay.set(true);
    }

    var gamePads=navigator.getGamepads();
    var count=0;

    for(var gp=0;gp< gamePads.length;gp++)
    {
        if(gamePads[gp])
        {
            var gamepad=gamePads[gp];
            if (gamepad && gamepad.pose)
            {
                cgl.pushMvMatrix();
                
                mat4.identity(gp1Matrix);
                mat4.translate(gp1Matrix,gp1Matrix,gamepad.pose.position);
                mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,gp1Matrix);
                
                // console.log(gamepad.pose);
                mat4.fromQuat(qMat, gamepad.pose.orientation);
                mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, qMat);
                
                triggerGamePad.trigger();
                
                cgl.popMvMatrix();
            }
            count++;
        }
    }
    
    numGamepads.set(count);

    if(vrDisplay && pose)
    {
        vrDisplay.submitFrame(pose);
    }
};

function requestVrFullscreen()
{
    
    vrDisplay.requestPresent([{ source: cgl.canvas }]).then(function ()
    {
        
        //   webglCanvas.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
        //   webglCanvas.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);

     console.log("requestPresent ok.");   
    }, function () {
      console.log("requestPresent failed.");
    });

//     if(!CABLES.UI && vrHMD)
//     {
//         var canvas=document.getElementById('glcanvas');
//         console.log('requesting HMD fullscreen!');
//     	if ( canvas.mozRequestFullScreen )
//     	{
// 		    console.log("requesting fullscreen...")
// 			canvas.mozRequestFullScreen( { vrDisplay: vrHMD } );
// 		}
// 		else if ( canvas.webkitRequestFullscreen )
// 		{
// 		    console.log("requesting fullscreen...")
// 			canvas.webkitRequestFullscreen( { vrDisplay: vrHMD } );
// 		}
//     }
    
}


if(navigator.getVRDisplays)
{
    console.log('loading devices...');
    navigator.getVRDisplays().then(function(devices)
    {
        console.log('hallo devices...');
        console.log(devices);
        var info='found devices:<br/>';
        
		for ( var i = 0; i < devices.length; i ++ )
		{
// 			if ( devices[ i ] instanceof HMDVRDevice )
// 				vrHMD = devices[ i ];
// 			else
// 			if ( devices[ i ] instanceof PositionSensorVRDevice ) 
// 			{
				vrDisplay=devices[i];
// 				console.log(devices[i]);
				info+='- '+devices[i].displayName+' <br/>';
// 			}
		}

		info+=' found input devices <br/>';
        op.uiAttr({info:info});
        op.uiAttr({warning:''});
    gui.patch().showOpParams(op);

        document.getElementById("glcanvas").ondblclick = requestVrFullscreen;

    });
}
else
{
    op.uiAttr({warning:'browser has no webvr api'});
}
