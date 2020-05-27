const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");
const inRed=op.inValueSlider("Red");

const cgl=op.patch.cgl;

function doRender()
{
    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();
}

var shader=new CGL.Shader(cgl,'MinimalMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.setSource(attachments.shader_vert,attachments.shader_frag);

// const uni=new CGL.Uniform(shader,'f','red',inRed);
shader.addUniformFrag("f","red",inRed);




render.onTriggered=doRender;