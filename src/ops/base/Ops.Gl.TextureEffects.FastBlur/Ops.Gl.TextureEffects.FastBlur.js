const
    render=op.inTrigger("render"),
    trigger=op.outTrigger("trigger"),
    amount=op.inValue("amount"),
    clamp=op.inBool("Clamp",false);

const cgl=op.patch.cgl;
amount.set(3);

const shader=new CGL.Shader(cgl);

shader.setSource(attachments.blur_vert,attachments.blur_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const uniDirX=new CGL.Uniform(shader,'f','dirX',0);
const uniDirY=new CGL.Uniform(shader,'f','dirY',0);
const uniWidth=new CGL.Uniform(shader,'f','width',0);
const uniHeight=new CGL.Uniform(shader,'f','height',0);
const uniPass=new CGL.Uniform(shader,'f','pass',0);
const uniAmount=new CGL.Uniform(shader,'f','amount',amount.get());
amount.onValueChange(function(){ uniAmount.setValue(amount.get()); });

var direction=op.addInPort(new CABLES.Port(op,"direction",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['both','vertical','horizontal']}));
var dir=0;
direction.set('both');
direction.onValueChange(function()
{
    if(direction.get()=='both')dir=0;
    if(direction.get()=='horizontal')dir=1;
    if(direction.get()=='vertical')dir=2;
});

clamp.onChange= () => { shader.toggleDefine("CLAMP",clamp.get()); };

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);
    var numPasses=amount.get();

    for(var i=0;i<numPasses;i++)
    {
        cgl.pushShader(shader);

        uniPass.setValue(i/numPasses);

        // first pass
        if(dir===0 || dir==2)
        {
            cgl.currentTextureEffect.bind();
            cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);

            uniDirX.setValue(0.0);
            uniDirY.setValue(1.0+ (i*i ) );

            cgl.currentTextureEffect.finish();
        }

        // second pass
        if(dir===0 || dir==1)
        {
            cgl.currentTextureEffect.bind();
            cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);

            uniDirX.setValue(1.0+ (i*i ) );
            uniDirY.setValue(0.0);

            cgl.currentTextureEffect.finish();
        }

        cgl.popShader();
    }

    trigger.trigger();
};
